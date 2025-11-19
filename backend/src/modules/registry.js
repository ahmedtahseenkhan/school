// Central module registry. Each module declares a slug, basePath and a router factory.
// Routers are imported from existing route files to avoid moving code during the initial refactor.

module.exports = [
  { slug: 'auth', basePath: '/auth', gate: false, getRouter: () => require('./auth/routes') },
  { slug: 'users', basePath: '/users', gate: false, getRouter: () => require('./users/routes') },
  { slug: 'announcements', basePath: '/announcements', gate: false, getRouter: () => require('./announcements/routes') },
  { slug: 'branches', basePath: '/branches', gate: true, getRouter: () => require('./branches/routes') },
  { slug: 'rbac', basePath: '/rbac', gate: false, getRouter: () => require('./rbac/routes') },
  { slug: 'modules', basePath: '/modules', gate: false, getRouter: () => require('./modules/routes') },
  { slug: 'hr', basePath: '/hr', gate: false, getRouter: () => require('./hr/routes') },
  { slug: 'admin', basePath: '/admin', gate: false, getRouter: () => require('./admin/routes') },
];
