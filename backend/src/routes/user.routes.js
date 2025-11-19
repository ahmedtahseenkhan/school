const express = require('express');
const router = express.Router();
const userController = require('../modules/users/controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createUserSchema, updateUserSchema } = require('../validations/user.validation');
const { requireModuleAccess } = require('../middleware/module.middleware');

router.use(requireModuleAccess('users'));
router.get('/', authenticate, authorize(['super_admin', 'admin']), userController.list);
// Allow unauthenticated first-user creation; service enforces role checks otherwise
router.post('/', validate(createUserSchema), userController.create);
router.get('/:id', authenticate, authorize(['super_admin', 'admin']), userController.getById);
router.put('/:id', authenticate, authorize(['super_admin', 'admin']), validate(updateUserSchema), userController.update);
router.delete('/:id', authenticate, authorize(['super_admin', 'admin']), userController.remove);

module.exports = router;
