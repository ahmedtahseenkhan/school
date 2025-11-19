const jwt = require('jsonwebtoken');
const db = require('../utils/database/connection');

async function superAdminAuth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Super admin token required' });
    const decoded = jwt.verify(token, process.env.SUPER_ADMIN_JWT_SECRET);
    const { rows } = await db.query('SELECT id, email, name, role, is_active FROM super_admins WHERE id = $1 AND is_active = TRUE', [decoded.id]);
    const sa = rows[0];
    if (!sa) return res.status(401).json({ error: 'Invalid super admin token' });
    req.superAdmin = sa;
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'Please authenticate as super admin' });
  }
}

function generateInstanceToken(tenant) {
  return jwt.sign(
    { tenantId: tenant.id, type: 'instance_sync', permissions: ['sync', 'module_management'] },
    process.env.INSTANCE_JWT_SECRET,
    { expiresIn: '1h' }
  );
}

module.exports = { superAdminAuth, generateInstanceToken };
