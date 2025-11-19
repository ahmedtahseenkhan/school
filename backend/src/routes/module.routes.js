const express = require('express');
const router = express.Router();
const moduleController = require('../modules/modules/controllers/module.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Admin management of modules and flags
router.get('/', authenticate, authorize(['super_admin','admin']), moduleController.list);
router.put('/:slug/enabled', authenticate, authorize(['super_admin','admin']), moduleController.setEnabled);
router.get('/:slug/flags', authenticate, authorize(['super_admin','admin']), moduleController.listFlags);
router.put('/:slug/flags', authenticate, authorize(['super_admin','admin']), moduleController.setFlag);

module.exports = router;
