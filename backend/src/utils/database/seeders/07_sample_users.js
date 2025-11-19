const bcrypt = require('bcryptjs');

async function findOne(db, query, params) {
  const { rows } = await db.query(query, params);
  return rows[0] || null;
}

async function upsertUser(db, { email, password, role, branchCode, first_name, last_name, status }) {
  const existing = await findOne(db, 'SELECT id FROM users WHERE email = $1', [email]);
  if (existing) return existing.id;
  const branch = branchCode ? await findOne(db, 'SELECT id FROM branches WHERE code = $1', [branchCode]) : null;
  const roleRow = await findOne(db, 'SELECT id FROM roles WHERE name = $1', [role]);
  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, role, role_id, branch_id, first_name, last_name, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id`,
    [email, password_hash, role, roleRow ? roleRow.id : null, branch ? branch.id : null, first_name, last_name, status || 'active']
  );
  return rows[0].id;
}

async function run(db) {
  await upsertUser(db, { email: 'super@school.com', password: 'Super@123', role: 'super_admin', branchCode: null, first_name: 'Super', last_name: 'Admin' });
  await upsertUser(db, { email: 'admin@school.com', password: 'Admin@123', role: 'admin', branchCode: 'MAIN', first_name: 'School', last_name: 'Admin' });
  await upsertUser(db, { email: 'principal@school.com', password: 'Principal@123', role: 'principal', branchCode: 'MAIN', first_name: 'Main', last_name: 'Principal' });
  await upsertUser(db, { email: 'teacher@school.com', password: 'Teacher@123', role: 'teacher', branchCode: 'BR1', first_name: 'North', last_name: 'Teacher' });
  await upsertUser(db, { email: 'student@school.com', password: 'Student@123', role: 'student', branchCode: 'BR1', first_name: 'Test', last_name: 'Student' });
  await upsertUser(db, { email: 'parent@school.com', password: 'Parent@123', role: 'parent', branchCode: 'BR1', first_name: 'Test', last_name: 'Parent' });
}

module.exports = { run };
