const userService = require('../services/user.service');

exports.list = async (_req, res, next) => {
  try {
    const users = await userService.list();
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const user = await userService.create(req.body, req.user || {});
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const user = await userService.update(req.params.id, req.body, req.user);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await userService.remove(req.params.id, req.user);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
