const db = require('../utils/database/connection');
const userService = require('../modules/users/services/user.service');
const { getEffectivePermissions } = require('../services/permission.service');

exports.listUsers = async (req, res, next) => {
  try {
    const scopeBranch = req.scope?.branchId;
    if (scopeBranch) {
      const { rows } = await db.query('SELECT id, email, role, role_id, branch_id, first_name, last_name, status FROM users WHERE branch_id = $1 ORDER BY created_at DESC', [scopeBranch]);
      return res.json({ users: rows });
    }
    const users = await userService.list();
    res.json({ users });
  } catch (e) { next(e); }
};

exports.createUser = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) {
      payload.branch_id = req.user.branch_id;
    }
    const user = await userService.create(payload, req.user);
    res.status(201).json({ user });
  } catch (e) { next(e); }
};

exports.getUser = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, email, role, role_id, branch_id, first_name, last_name, status FROM users WHERE id = $1', [req.params.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (req.scope?.branchId && user.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ user });
  } catch (e) { next(e); }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (req.scope?.branchId && req.body.branch_id && req.body.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await userService.update(req.params.id, req.body, req.user);
    res.json({ user });
  } catch (e) { next(e); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT branch_id FROM users WHERE id = $1', [req.params.id]);
    const target = rows[0];
    if (!target) return res.status(404).json({ message: 'Not found' });
    if (req.scope?.branchId && target.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await userService.remove(req.params.id, req.user);
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.myPermissions = async (req, res, next) => {
  try {
    const effective = await getEffectivePermissions(req.user);
    res.json({ permissions: Array.from(effective.allow) });
  } catch (e) { next(e); }
};
