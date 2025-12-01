const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const ctrl = require('../controllers/super-admin.controller');

const router = express.Router();

// All routes require super_admin role (or *:manage permission)
router.use(authenticate, requirePermission('*:manage'));

// Branch Management
router.get('/branches', ctrl.listBranches);
router.post('/branches', ctrl.createBranch);
router.put('/branches/:id', ctrl.updateBranch);
router.delete('/branches/:id', ctrl.deleteBranch);

// Module Management (Global)
router.get('/modules', ctrl.listModules);
router.put('/modules/:slug', ctrl.toggleModule);

// Module Management (Per Branch)
router.get('/branches/:branchId/modules', ctrl.getBranchModules);
router.put('/branches/:branchId/modules/:moduleSlug', ctrl.updateBranchModule);

// Server Monitoring
router.get('/server/stats', ctrl.getServerStats);

module.exports = router;
