const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/database/connection');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const { rows } = await db.query('SELECT id, email, password_hash, name, role, is_active FROM super_admins WHERE email = $1', [email]);
  const sa = rows[0];
  if (!sa || !sa.is_active) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, sa.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: sa.id, role: sa.role }, process.env.SUPER_ADMIN_JWT_SECRET, { expiresIn: '7d' });
  delete sa.password_hash;
  res.json({ token, superAdmin: sa });
};
