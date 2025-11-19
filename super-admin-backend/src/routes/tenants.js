const express = require('express');
const TenantController = require('../controllers/tenant.controller');
const { superAdminAuth } = require('../middleware/superAuth');

const router = express.Router();

router.get('/', superAdminAuth, TenantController.getTenants);
router.post('/', superAdminAuth, TenantController.createTenant);
router.get('/:id', superAdminAuth, TenantController.getTenant);
router.put('/:id', superAdminAuth, TenantController.updateTenant);
router.post('/:id/suspend', superAdminAuth, TenantController.suspendTenant);
router.post('/:id/activate', superAdminAuth, TenantController.activateTenant);

router.get('/:id/usage', superAdminAuth, TenantController.getTenantUsage);
router.get('/:id/health', superAdminAuth, TenantController.checkTenantHealth);
router.post('/:id/sync', superAdminAuth, TenantController.syncTenantData);
router.get('/:id/modules', superAdminAuth, TenantController.getTenantModules);
router.post('/:id/modules', superAdminAuth, TenantController.updateTenantModules);

router.post('/:id/restart', superAdminAuth, TenantController.restartInstance);
router.post('/:id/backup', superAdminAuth, TenantController.createBackup);

module.exports = router;
