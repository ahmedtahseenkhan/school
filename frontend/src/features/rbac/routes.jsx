import React from 'react';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';
import { Route } from 'react-router-dom';

import PermissionDashboard from './pages/PermissionDashboard.jsx';
import RoleManager from './pages/RoleManager.jsx';
import ModulesManager from './pages/ModulesManager.jsx';
import UserAccessManager from './pages/UserAccessManager.jsx';

export const RBACRoutes = (
  <>
    <Route path="permissions/dashboard" element={<PermissionGuard anyOf={["role:read","*:manage"]}><PermissionDashboard /></PermissionGuard>} />
    <Route path="permissions/roles" element={<PermissionGuard anyOf={["role:read","*:manage"]}><RoleManager /></PermissionGuard>} />
    <Route path="permissions/modules" element={<PermissionGuard anyOf={["*:manage"]}><ModulesManager /></PermissionGuard>} />
    <Route path="permissions/users" element={<PermissionGuard anyOf={["user:read","*:manage"]}><UserAccessManager /></PermissionGuard>} />
  </>
);
