const express = require('express');
const router = express.Router();
const announcementsController = require('../modules/announcements/controllers/announcements.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', announcementsController.list);
router.post('/', authenticate, authorize(['super_admin', 'admin', 'principal']), announcementsController.create);

module.exports = router;
