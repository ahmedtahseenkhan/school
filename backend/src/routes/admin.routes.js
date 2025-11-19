const express = require('express');
const router = express.Router();
const adminController = require('../modules/admin/controllers/admin.controller');
const instanceAuth = require('../middleware/instance.middleware');

router.get('/usage-stats', instanceAuth, adminController.getUsageStats);
router.post('/modules/toggle', instanceAuth, adminController.toggleModule);

module.exports = router;
