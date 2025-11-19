import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home.jsx';
import Login from './pages/auth/Login.jsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import Dashboard from './features/admin/pages/Dashboard.jsx';
import Users from './features/users/pages/Users.tsx';
import Settings from './features/settings/pages/Settings.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import { BranchRoutes } from './features/branches/routes.jsx';
import { SuperAdminRoutes } from './features/super-admin/routes.jsx';
import { HRRoutes } from './features/hr/routes.jsx';
import { RBACRoutes } from './features/rbac/routes.jsx';
import { SettingsRoutes } from './features/settings/routes.jsx';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        {HRRoutes}
        {RBACRoutes}
        {BranchRoutes}
        {SettingsRoutes}
        {SuperAdminRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
