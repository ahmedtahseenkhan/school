const express = require('express');
const router = express.Router();
const branchController = require('../modules/branches/controllers/branch.controller');
const branchAdminController = require('../modules/branches/controllers/branch.admin.controller');
const branchPermissionController = require('../modules/branches/controllers/branch.permission.controller');
const branchDataController = require('../modules/branches/controllers/branch.data.controller');
const branchReportController = require('../modules/branches/controllers/branch.report.controller');
const branchSwitchController = require('../modules/branches/controllers/branch.switch.controller');
const branchConfigController = require('../modules/branches/controllers/branch.config.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { attachBranchContext } = require('../middleware/branch.middleware');

router.get('/', branchController.list);
router.post('/', authenticate, authorize(['super_admin', 'admin']), branchController.create);
router.get('/:id', authenticate, authorize(['super_admin','admin']), branchController.getById);
router.put('/:id', authenticate, authorize(['super_admin','admin']), branchController.update);
router.delete('/:id', authenticate, authorize(['super_admin','admin']), branchController.remove);

// Branch Admin assignments
router.get('/:id/admins', authenticate, authorize(['super_admin','admin']), branchAdminController.listAdmins);
router.post('/:id/admins', authenticate, authorize(['super_admin','admin']), branchAdminController.assignAdmin);
router.delete('/:id/admins/:userId', authenticate, authorize(['super_admin','admin']), branchAdminController.removeAdmin);

// Branch Roles & Permissions
router.get('/:id/roles', authenticate, authorize(['super_admin','admin']), branchPermissionController.listRoles);
router.post('/:id/roles', authenticate, authorize(['super_admin','admin']), branchPermissionController.upsertRole);
router.get('/:id/users/:userId/permissions', authenticate, authorize(['super_admin','admin']), branchPermissionController.getUserBranchPermissions);
router.post('/:id/users/:userId/permissions', authenticate, authorize(['super_admin','admin']), branchPermissionController.setUserBranchPermissions);
router.get('/:id/modules', authenticate, authorize(['super_admin','admin']), branchPermissionController.listModules);
router.post('/:id/modules', authenticate, authorize(['super_admin','admin']), branchPermissionController.setModule);

// Master data synchronization
router.post('/:id/master-data', authenticate, authorize(['super_admin','admin']), branchDataController.upsertMasterData);

// Reports
router.get('/:id/reports/overview', authenticate, attachBranchContext, authorize(['super_admin','admin']), branchReportController.overview);
router.get('/reports/overview-all', authenticate, authorize(['super_admin']), branchReportController.overviewAll);

// Branch switching (context)
router.post('/switch', authenticate, branchSwitchController.switchBranch);

// Branch-specific configurations
router.get('/:id/configs', authenticate, authorize(['super_admin','admin']), branchConfigController.list);
router.put('/:id/configs/:key', authenticate, authorize(['super_admin','admin']), branchConfigController.upsert);
router.delete('/:id/configs/:key', authenticate, authorize(['super_admin','admin']), branchConfigController.remove);

module.exports = router;
