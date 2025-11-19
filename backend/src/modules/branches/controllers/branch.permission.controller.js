const db = require('../../../utils/database/connection');

exports.listRoles = async (req, res, next) => {
  try {
    const { id } = req.params; // branch id
    const { rows } = await db.query(
      'SELECT id, branch_id, name, description, permissions, is_system_role, hierarchy_level, is_active FROM branch_roles WHERE branch_id = $1 ORDER BY hierarchy_level DESC, name ASC',
      [id]
    );
    res.json({ roles: rows });
  } catch (e) { next(e); }
};

exports.upsertRole = async (req, res, next) => {
  try {
    const { id } = req.params; // branch id
    const { role_id, name, description, permissions = [], is_system_role = false, hierarchy_level = 0, is_active = true } = req.body;
    let row;
    if (role_id) {
      const { rows } = await db.query(
        `UPDATE branch_roles SET
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          permissions = COALESCE($4, permissions),
          is_system_role = COALESCE($5, is_system_role),
          hierarchy_level = COALESCE($6, hierarchy_level),
          is_active = COALESCE($7, is_active)
         WHERE id = $1 AND branch_id = $8
         RETURNING id, branch_id, name, description, permissions, is_system_role, hierarchy_level, is_active`,
        [role_id, name, description, JSON.stringify(permissions), is_system_role, hierarchy_level, is_active, id]
      );
      row = rows[0];
    } else {
      const { rows } = await db.query(
        `INSERT INTO branch_roles (branch_id, name, description, permissions, is_system_role, hierarchy_level, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, branch_id, name, description, permissions, is_system_role, hierarchy_level, is_active`,
        [id, name, description, JSON.stringify(permissions), is_system_role, hierarchy_level, is_active]
      );
      row = rows[0];
    }
    res.status(role_id ? 200 : 201).json({ role: row });
  } catch (e) { next(e); }
};

exports.getUserBranchPermissions = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { rows } = await db.query(
      `SELECT ubp.id, ubp.user_id, ubp.branch_id, ubp.role_id, ubp.permissions, ubp.is_active, ubp.granted_at, br.name AS role_name
       FROM user_branch_permissions ubp LEFT JOIN branch_roles br ON br.id = ubp.role_id
       WHERE ubp.branch_id = $1 AND ubp.user_id = $2`,
      [id, userId]
    );
    res.json({ assignment: rows[0] || null });
  } catch (e) { next(e); }
};

exports.setUserBranchPermissions = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { role_id = null, permissions = [], is_active = true, expires_at = null } = req.body;
    const { rows } = await db.query(
      `INSERT INTO user_branch_permissions (user_id, branch_id, role_id, permissions, granted_by, is_active, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id, branch_id) DO UPDATE SET role_id = EXCLUDED.role_id, permissions = EXCLUDED.permissions, is_active = EXCLUDED.is_active, expires_at = EXCLUDED.expires_at
       RETURNING id, user_id, branch_id, role_id, permissions, is_active, granted_at, expires_at`,
      [userId, id, role_id, JSON.stringify(permissions), req.user?.id || null, is_active, expires_at]
    );
    res.json({ assignment: rows[0] });
  } catch (e) { next(e); }
};

exports.listModules = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT bm.id, bm.module_name, bm.is_enabled, bm.config, bm.enabled_features
       FROM branch_modules bm WHERE bm.branch_id = $1 ORDER BY module_name ASC`,
      [id]
    );
    res.json({ modules: rows });
  } catch (e) { next(e); }
};

exports.setModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { module_name, is_enabled = true, config = {}, enabled_features = [] } = req.body;
    const { rows } = await db.query(
      `INSERT INTO branch_modules (branch_id, module_name, is_enabled, config, enabled_features)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (branch_id, module_name) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, config = EXCLUDED.config, enabled_features = EXCLUDED.enabled_features
       RETURNING id, branch_id, module_name, is_enabled, config, enabled_features`,
      [id, module_name, is_enabled, JSON.stringify(config), JSON.stringify(enabled_features)]
    );
    res.json({ module: rows[0] });
  } catch (e) { next(e); }
};
