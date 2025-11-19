const { getEffectivePermissions, hasPermission, resolveBranchScope } = require('../services/permission.service');

function attachBranchScope(req, _res, next) {
  req.scope = req.scope || {};
  req.scope.branchId = resolveBranchScope(req.user);
  next();
}

function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const effective = await getEffectivePermissions(req.user);
    if (!hasPermission(effective, permission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.permissions = effective;
    next();
  };
}

function requireOwnOrPermission(basePermission, ownPermission, paramKey = 'id') {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const effective = await getEffectivePermissions(req.user);
    const isOwn = req.user.id === req.params[paramKey];
    if (isOwn && hasPermission(effective, ownPermission)) return next();
    if (hasPermission(effective, basePermission)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = { attachBranchScope, requirePermission, requireOwnOrPermission };
