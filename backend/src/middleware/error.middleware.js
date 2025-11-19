exports.notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
};

exports.errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
};
