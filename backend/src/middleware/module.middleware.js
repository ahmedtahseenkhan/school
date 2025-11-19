const { isModuleEnabled } = require('../services/module.service');
const { getEffectivePermissions, hasPermission } = require('../services/permission.service');

function requireModuleAccess(moduleSlug) {
  return async (req, res, next) => {
    try {
      const enabled = await isModuleEnabled(moduleSlug);
      if (!enabled) return res.status(404).json({ message: 'Module disabled' });
      if (!req.user) return next(); // allow public routes when no auth is required by route
      const effective = await getEffectivePermissions(req.user);
      const perm = `module:${moduleSlug}:access`;
      if (req.user.role === 'super_admin' || hasPermission(effective, perm)) return next();
      return res.status(403).json({ message: 'Forbidden' });
    } catch (e) {
      return res.status(500).json({ message: 'Server error' });
    }
  };
}

module.exports = { requireModuleAccess };
