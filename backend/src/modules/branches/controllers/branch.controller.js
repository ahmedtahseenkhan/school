const branchService = require('../services/branch.service');

exports.list = async (_req, res, next) => {
  try {
    const branches = await branchService.list();
    res.json({ branches });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const branch = await branchService.create(req.body, req.user);
    res.status(201).json({ branch });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const branch = await branchService.getById(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Not found' });
    res.json({ branch });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const branch = await branchService.update(req.params.id, req.body, req.user);
    if (!branch) return res.status(404).json({ message: 'Not found' });
    res.json({ branch });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await branchService.remove(req.params.id, req.user);
    res.json(result);
  } catch (err) { next(err); }
};
