module.exports = (schema) => async (req, res, next) => {
  try {
    if (!schema) return next();
    const value = await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    req.body = value;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Validation error', details: err.details?.map(d => d.message) || [] });
  }
};
