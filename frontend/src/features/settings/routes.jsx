import React from 'react';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';
import { Route } from 'react-router-dom';
import LookupsPage from './pages/Lookups.jsx';

export const SettingsRoutes = (
  <>
    <Route path="settings/lookups" element={<PermissionGuard anyOf={["hr.lookup:read","*:manage"]}><LookupsPage /></PermissionGuard>} />
  </>
);
