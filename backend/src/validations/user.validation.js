const Joi = require('joi');

const roles = ['super_admin','admin','principal','teacher','student','parent','accountant','librarian'];
const statuses = ['active','inactive','suspended'];

exports.createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...roles).optional(),
  branch_id: Joi.string().guid({ version: 'uuidv4' }).allow(null),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  status: Joi.string().valid(...statuses).optional()
});

exports.updateUserSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid(...roles),
  branch_id: Joi.string().guid({ version: 'uuidv4' }).allow(null),
  first_name: Joi.string(),
  last_name: Joi.string(),
  status: Joi.string().valid(...statuses)
});
