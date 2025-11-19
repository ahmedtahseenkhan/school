const db = require('../utils/database/connection');

async function getRolePermissions(roleId) {
  if (!roleId) return { allow: new Set(), deny: new Set() };
  const { rows } = await db.query(
    `SELECT p.name FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = $1`, [roleId]
  );
  return { allow: new Set(rows.map(r => r.name)), deny: new Set() };
}

async function getUserOverrides(userId) {
  const { rows } = await db.query(
    `SELECT p.name, up.grant_type FROM user_permissions up
     JOIN permissions p ON p.id = up.permission_id
     WHERE up.user_id = $1`, [userId]
  );
  const allow = new Set(rows.filter(r => r.grant_type === 'ALLOW').map(r => r.name));
  const deny = new Set(rows.filter(r => r.grant_type === 'DENY').map(r => r.name));
  return { allow, deny };
}

async function getEffectivePermissions(user) {
  // super_admin via enum role always full access
  if (user.role === 'super_admin') {
    return { allow: new Set(['*:manage']), deny: new Set() };
  }
  const rolePerms = await getRolePermissions(user.role_id);
  const userOverrides = await getUserOverrides(user.id);
  const allow = new Set([...rolePerms.allow, ...userOverrides.allow]);
  const deny = new Set(userOverrides.deny);
  return { allow, deny };
}

function hasPermission(effective, perm) {
  if (effective.allow.has('*:manage')) return true;
  if (effective.deny.has(perm)) return false;
  if (effective.allow.has(perm)) return true;
  return false;
}

function resolveBranchScope(user) {
  if (user.role === 'super_admin' || user.role === 'admin') return null; // all branches
  return user.branch_id || null; // restrict to own branch by default
}

module.exports = { getEffectivePermissions, hasPermission, resolveBranchScope };
