const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/database/connection');

function signToken(user) {
  const payload = { id: user.id, role: user.role, role_id: user.role_id || null, branch_id: user.branch_id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return token;
}

exports.login = async (email, password) => {
  const { rows } = await db.query(
    'SELECT id, email, password_hash, role, role_id, branch_id, first_name, last_name, status FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signToken(user);
  delete user.password_hash;
  return { token, user };
};
