const db = require('../../../utils/database/connection');

exports.list = async () => {
  const { rows } = await db.query(
    "SELECT id, school_id, name, code, type, address, phone, email, principal_id, is_active FROM branches WHERE is_active = TRUE ORDER BY name ASC"
  );
  return rows;
};

exports.create = async (payload, actor) => {
  if (!['super_admin','admin'].includes(actor.role)) {
    const err = new Error('Forbidden'); err.status = 403; throw err;
  }
  const { school_id, name, code, type = 'branch', address, phone, email, principal_id, is_active = true } = payload;
  const { rows } = await db.query(
    `INSERT INTO branches (school_id, name, code, type, address, phone, email, principal_id, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id, school_id, name, code, type, address, phone, email, principal_id, is_active`,
    [school_id, name, code, type, address, phone, email, principal_id, is_active]
  );
  return rows[0];
};

exports.getById = async (id) => {
  const { rows } = await db.query(
    'SELECT id, school_id, name, code, type, address, phone, email, principal_id, is_active FROM branches WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

exports.update = async (id, payload, actor) => {
  if (!['super_admin','admin'].includes(actor.role)) {
    const err = new Error('Forbidden'); err.status = 403; throw err;
  }
  const fields = ['name','code','type','address','phone','email','principal_id','is_active'];
  const sets = [];
  const values = [];
  let idx = 1;
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(payload, f)) {
      sets.push(`${f} = $${idx++}`);
      values.push(payload[f]);
    }
  }
  if (!sets.length) return await exports.getById(id);
  values.push(id);
  const { rows } = await db.query(
    `UPDATE branches SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, school_id, name, code, type, address, phone, email, principal_id, is_active`,
    values
  );
  return rows[0] || null;
};

exports.remove = async (id, actor) => {
  if (!['super_admin','admin'].includes(actor.role)) {
    const err = new Error('Forbidden'); err.status = 403; throw err;
  }
  await db.query('UPDATE branches SET is_active = FALSE, updated_at = NOW() WHERE id = $1', [id]);
  return { success: true };
};
