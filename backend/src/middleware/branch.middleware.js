const db = require('../utils/database/connection');

// Resolve branch context from header or subdomain, with role checks
// Priority: X-Branch-Id -> X-Branch-Code -> subdomain
// Only super_admin/admin may switch arbitrary branch; others are restricted to their own branch
async function attachBranchContext(req, res, next) {
  try {
    req.scope = req.scope || {};
    const host = (req.headers.host || '').split(':')[0];
    const subdomain = host.split('.').length > 2 ? host.split('.')[0] : null;
    const headerBranchId = req.headers['x-branch-id'];
    const headerBranchCode = req.headers['x-branch-code'];

    const isElevated = req.user && (req.user.role === 'super_admin' || req.user.role === 'admin');

    let branchId = null;
    if (headerBranchId && isElevated) {
      branchId = headerBranchId;
    } else if (headerBranchCode && isElevated) {
      const { rows } = await db.query('SELECT id FROM branches WHERE code = $1', [headerBranchCode]);
      branchId = rows[0]?.id || null;
    } else if (subdomain) {
      const { rows } = await db.query('SELECT id FROM branches WHERE subdomain = $1 AND is_active = TRUE', [subdomain]);
      branchId = rows[0]?.id || null;
    }

    if (!branchId && req.user && !isElevated) {
      branchId = req.user.branch_id || null;
    }

    // If non-elevated tries to switch to different branch via headers, deny
    if (!isElevated && headerBranchId && headerBranchId !== (req.user?.branch_id || null)) {
      return res.status(403).json({ message: 'Forbidden: cannot switch branch' });
    }

    req.scope.branchId = branchId;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { attachBranchContext };
