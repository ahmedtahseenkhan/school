import React from 'react';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';
import SuperAdminDashboard from './pages/Dashboard.jsx';
import { Route } from 'react-router-dom';

export const SuperAdminRoutes = (
  <>
    <Route path="super-admin/dashboard" element={<PermissionGuard anyOf={["*:manage"]}><SuperAdminDashboard /></PermissionGuard>} />
  </>
);
