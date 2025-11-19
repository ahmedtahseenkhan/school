const bcrypt = require('bcryptjs');
const db = require('../../../utils/database/connection');

exports.list = async () => {
  const { rows } = await db.query('SELECT id, email, role, role_id, branch_id, first_name, last_name, status FROM users ORDER BY created_at DESC');
  return rows;
};

exports.create = async (payload, actor) => {
  const { email, password, role, branch_id, first_name, last_name, status = 'active' } = payload;

  const { rows: countRows } = await db.query('SELECT COUNT(*)::int as count FROM users');
  const isFirstUser = countRows[0].count === 0;

  if (!isFirstUser && actor.role !== 'super_admin' && actor.role !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const roleName = isFirstUser ? 'super_admin' : role;
  const { rows: roleRows } = await db.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  const role_id = roleRows[0]?.id || null;
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, role, role_id, branch_id, first_name, last_name, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, email, role, role_id, branch_id, first_name, last_name, status`,
    [email, password_hash, roleName, role_id, branch_id, first_name, last_name, status]
  );
  return rows[0];
};

exports.getById = async (id) => {
  const { rows } = await db.query('SELECT id, email, role, role_id, branch_id, first_name, last_name, status FROM users WHERE id = $1', [id]);
  return rows[0];
};

exports.update = async (id, payload, actor) => {
  if (actor.role !== 'super_admin' && actor.role !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  const fields = [];
  const values = [];
  let idx = 1;
  let newRoleName = null;
  for (const [k, v] of Object.entries(payload)) {
    if (['email','role','branch_id','first_name','last_name','status'].includes(k)) {
      fields.push(`${k} = $${idx++}`);
      values.push(v);
      if (k === 'role') newRoleName = v;
    }
  }
  if (newRoleName) {
    const { rows: r } = await db.query('SELECT id FROM roles WHERE name = $1', [newRoleName]);
    const rid = r[0]?.id || null;
    fields.push(`role_id = $${idx++}`);
    values.push(rid);
  }
  if (payload.password) {
    const password_hash = await bcrypt.hash(payload.password, 10);
    fields.push(`password_hash = $${idx++}`);
    values.push(password_hash);
  }
  if (!fields.length) return exports.getById(id);
  values.push(id);
  const { rows } = await db.query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, email, role, role_id, branch_id, first_name, last_name, status`
  , values);
  return rows[0];
};

exports.remove = async (id, actor) => {
  if (actor.role !== 'super_admin' && actor.role !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};
