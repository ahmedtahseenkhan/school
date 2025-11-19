import React from 'react';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';
import BranchList from './pages/BranchList.jsx';
import BranchForm from './pages/BranchForm.jsx';
import { Route } from 'react-router-dom';

export const BranchRoutes = (
  <>
    <Route path="branches" element={<PermissionGuard anyOf={["*:manage"]}><BranchList /></PermissionGuard>} />
    <Route path="branches/new" element={<PermissionGuard anyOf={["*:manage"]}><BranchForm /></PermissionGuard>} />
    <Route path="branches/:id" element={<PermissionGuard anyOf={["*:manage"]}><BranchForm /></PermissionGuard>} />
  </>
);
