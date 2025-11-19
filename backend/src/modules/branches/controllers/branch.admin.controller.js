const db = require('../../../utils/database/connection');

exports.listAdmins = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT ba.id, ba.user_id, u.email, u.first_name, u.last_name, ba.role, ba.permissions, ba.is_active, ba.assigned_at
       FROM branch_admins ba JOIN users u ON u.id = ba.user_id
       WHERE ba.branch_id = $1 ORDER BY ba.assigned_at DESC`,
      [id]
    );
    res.json({ admins: rows });
  } catch (e) { next(e); }
};

exports.assignAdmin = async (req, res, next) => {
  try {
    const { id } = req.params; // branch id
    const { user_id, role = 'branch_admin', permissions = [] } = req.body;
    const { rows } = await db.query(
      `INSERT INTO branch_admins (branch_id, user_id, role, permissions, assigned_by)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (branch_id, user_id) DO UPDATE SET role = EXCLUDED.role, permissions = EXCLUDED.permissions, is_active = TRUE, assigned_at = NOW()
       RETURNING id, branch_id, user_id, role, permissions, is_active, assigned_at`,
      [id, user_id, role, JSON.stringify(permissions), req.user?.id || null]
    );
    res.status(201).json({ assignment: rows[0] });
  } catch (e) { next(e); }
};

exports.removeAdmin = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    await db.query('UPDATE branch_admins SET is_active = FALSE WHERE branch_id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (e) { next(e); }
};
