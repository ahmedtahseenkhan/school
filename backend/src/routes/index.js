const express = require('express');
const modules = require('../modules/registry');
const { requireModuleAccess } = require('../middleware/module.middleware');

const router = express.Router();

modules.forEach((m) => {
  const middlewares = [];
  if (m.gate) middlewares.push(requireModuleAccess(m.slug));
  router.use(m.basePath, ...middlewares, m.getRouter());
});

module.exports = router;
