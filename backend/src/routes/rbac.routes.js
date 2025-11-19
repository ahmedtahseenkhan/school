const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, requireOwnOrPermission } = require('../middleware/permission.middleware');
const { attachBranchContext } = require('../middleware/branch.middleware');
const ctrl = require('../controllers/rbac.controller');
const radmin = require('../modules/rbac/controllers/rbac.admin.controller');

const router = express.Router();

router.use(authenticate, attachBranchContext);

router.get('/users', requirePermission('user:read'), ctrl.listUsers);
router.post('/users', requirePermission('user:create'), ctrl.createUser);
router.get('/users/:id', requirePermission('user:read'), ctrl.getUser);
router.put('/users/:id', requirePermission('user:update'), ctrl.updateUser);
router.delete('/users/:id', requirePermission('user:delete'), ctrl.deleteUser);

// Own profile example
router.get('/users/:id/profile', requireOwnOrPermission('user:read', 'user:read_own_profile'), ctrl.getUser);

// Current user's effective permissions
router.get('/permissions/me', ctrl.myPermissions);

// RBAC Admin management (admin/super_admin)
router.get('/roles', requirePermission('*:manage'), radmin.listRoles);
router.get('/permissions', requirePermission('*:manage'), radmin.listPermissions);
router.get('/roles/:roleId/permissions', requirePermission('*:manage'), radmin.getRolePermissions);
router.post('/roles/:roleId/permissions', requirePermission('*:manage'), radmin.setRolePermissions);
router.get('/users/:userId/permissions', requirePermission('*:manage'), radmin.getUserPermissions);
router.post('/users/:userId/permissions', requirePermission('*:manage'), radmin.setUserPermissions);
router.get('/modules', requirePermission('*:manage'), radmin.listModules);

module.exports = router;
