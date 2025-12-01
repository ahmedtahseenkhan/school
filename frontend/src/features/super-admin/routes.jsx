import React from 'react';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';
import { Route } from 'react-router-dom';

import SuperAdminDashboard from './pages/Dashboard.jsx';
import BranchManagement from './pages/BranchManagement.jsx';
import ModuleLicensing from './pages/ModuleLicensing.jsx';
import ServerMonitor from './pages/ServerMonitor.jsx';

export const SuperAdminRoutes = (
  <>
    <Route path="super-admin/dashboard" element={<PermissionGuard anyOf={["*:manage"]}><SuperAdminDashboard /></PermissionGuard>} />
    <Route path="super-admin/branches" element={<PermissionGuard anyOf={["*:manage"]}><BranchManagement /></PermissionGuard>} />
    <Route path="super-admin/modules" element={<PermissionGuard anyOf={["*:manage"]}><ModuleLicensing /></PermissionGuard>} />
    <Route path="super-admin/server" element={<PermissionGuard anyOf={["*:manage"]}><ServerMonitor /></PermissionGuard>} />
  </>
);
