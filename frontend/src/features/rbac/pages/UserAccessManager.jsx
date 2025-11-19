import React from 'react';
import UserPermissions from '@/components/permissions/UserPermissions.jsx';

export default function UserAccessManager() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Access Manager</h1>
      <UserPermissions />
    </div>
  );
}
