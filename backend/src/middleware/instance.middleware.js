const jwt = require('jsonwebtoken');

module.exports = function instanceSuperAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Instance token required' });
    const decoded = jwt.verify(token, process.env.INSTANCE_JWT_SECRET);
    if (decoded.type !== 'instance_sync') return res.status(403).json({ error: 'Invalid token type' });
    req.superAdmin = { tenantId: decoded.tenantId, permissions: decoded.permissions || [] };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid instance token' });
  }
};
