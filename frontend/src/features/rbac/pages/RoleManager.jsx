import React from 'react';
import RolePermissions from '@/components/permissions/RolePermissions.jsx';
import * as rbac from '@/services/rbac.service.js';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';

export default function RoleManager() {
  const [roles, setRoles] = React.useState([]);
  const [roleId, setRoleId] = React.useState('');

  React.useEffect(() => {
    rbac.listRoles().then((r) => {
      setRoles(r);
      if (r.length && !roleId) setRoleId(r[0].id);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Role Manager</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="font-semibold">Select Role</div>
            <div className="w-64">
              <Select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                options={roles.map((r) => ({ label: r.name, value: r.id }))}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {roleId ? <RolePermissions roleId={roleId} /> : <div className="text-sm text-gray-500">No role selected.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
