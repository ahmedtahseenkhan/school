import React from 'react';
import PermissionManager from './PermissionManager.jsx';
import * as rbac from '@/services/rbac.service.js';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

export default function RolePermissions({ roleId }) {
  const [allPerms, setAllPerms] = React.useState([]);
  const [rolePerms, setRolePerms] = React.useState(new Set());
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    rbac.listPermissions().then((p) => setAllPerms(p));
  }, []);

  React.useEffect(() => {
    if (!roleId) return;
    rbac.getRolePermissions(roleId).then((ps) => setRolePerms(new Set(ps.map((x) => x.name))));
  }, [roleId]);

  const toggle = (name) => {
    setRolePerms((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await rbac.setRolePermissions(roleId, Array.from(rolePerms));
    } finally {
      setSaving(false);
    }
  };

  const grouped = React.useMemo(() => {
    const g = {};
    for (const p of allPerms) {
      const key = p.module || 'system';
      g[key] = g[key] || [];
      g[key].push(p);
    }
    return g;
  }, [allPerms]);

  return (
    <div className="space-y-4">
      <PermissionManager />
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Toggle permissions below and click Save.</div>
        <Button onClick={onSave} disabled={!roleId || saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
      {Object.entries(grouped).map(([mod, items]) => (
        <div key={mod} className="border rounded-md">
          <div className="px-3 py-2 font-semibold bg-gray-50 dark:bg-gray-800">{mod}</div>
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {items.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <Checkbox checked={rolePerms.has(p.name)} onChange={() => toggle(p.name)} />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
