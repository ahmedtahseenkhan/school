const db = require('../utils/database/connection');

exports.listRoles = async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, name, description FROM roles ORDER BY name ASC');
    res.json({ roles: rows });
  } catch (e) { next(e); }
};

exports.listPermissions = async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, name, description, module FROM permissions ORDER BY module, name');
    res.json({ permissions: rows });
  } catch (e) { next(e); }
};

exports.getRolePermissions = async (req, res, next) => {
  try {
    const roleId = req.params.roleId;
    const { rows } = await db.query(
      `SELECT p.id, p.name FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id WHERE rp.role_id = $1 ORDER BY p.name`,
      [roleId]
    );
    res.json({ permissions: rows });
  } catch (e) { next(e); }
};

exports.setRolePermissions = async (req, res, next) => {
  try {
    const roleId = req.params.roleId;
    const names = Array.isArray(req.body?.permissions) ? req.body.permissions : [];
    await db.query('BEGIN');
    await db.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
    if (names.length) {
      const { rows: permRows } = await db.query('SELECT id, name FROM permissions WHERE name = ANY($1::text[])', [names]);
      for (const p of permRows) {
        await db.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [roleId, p.id]);
      }
    }
    await db.query('COMMIT');
    res.json({ success: true });
  } catch (e) { await db.query('ROLLBACK'); next(e); }
};

exports.getUserPermissions = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { rows } = await db.query(
      `SELECT p.id, p.name, up.grant_type FROM user_permissions up JOIN permissions p ON p.id = up.permission_id WHERE up.user_id = $1 ORDER BY p.name`,
      [userId]
    );
    res.json({ overrides: rows });
  } catch (e) { next(e); }
};

exports.setUserPermissions = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const payload = Array.isArray(req.body?.overrides) ? req.body.overrides : [];
    await db.query('BEGIN');
    await db.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);
    if (payload.length) {
      const names = payload.map((o) => o.name);
      const { rows: permRows } = await db.query('SELECT id, name FROM permissions WHERE name = ANY($1::text[])', [names]);
      const idByName = new Map(permRows.map(r => [r.name, r.id]));
      for (const o of payload) {
        const pid = idByName.get(o.name);
        const grant = (o.grant_type || 'ALLOW').toUpperCase() === 'DENY' ? 'DENY' : 'ALLOW';
        if (pid) await db.query('INSERT INTO user_permissions (user_id, permission_id, grant_type) VALUES ($1,$2,$3)', [userId, pid, grant]);
      }
    }
    await db.query('COMMIT');
    res.json({ success: true });
  } catch (e) { await db.query('ROLLBACK'); next(e); }
};

exports.listModules = async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, slug, name, description, is_enabled FROM modules ORDER BY name');
    res.json({ modules: rows });
  } catch (e) { next(e); }
};
