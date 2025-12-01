import React from 'react';
import PermissionManager from './PermissionManager.jsx';
import * as rbac from '@/services/rbac.service.js';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { toast } from 'react-hot-toast';

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

  const toggleGroup = (items, selectAll) => {
    setRolePerms((prev) => {
      const next = new Set(prev);
      items.forEach(p => {
        if (selectAll) next.add(p.name);
        else next.delete(p.name);
      });
      return next;
    });
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await rbac.setRolePermissions(roleId, Array.from(rolePerms));
      toast.success('Permissions saved successfully');
    } catch (error) {
      toast.error('Failed to save permissions');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold">Permission Assignment</h2>
          <p className="text-sm text-gray-500">Select permissions to assign to this role.</p>
        </div>
        <Button onClick={onSave} disabled={!roleId || saving} className="bg-blue-600 hover:bg-blue-700 text-white">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(grouped).map(([mod, items]) => {
          const allSelected = items.every(p => rolePerms.has(p.name));
          const someSelected = items.some(p => rolePerms.has(p.name));

          return (
            <div key={mod} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold capitalize text-gray-900 dark:text-white">{mod.replace(/_/g, ' ')}</h3>
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={(e) => toggleGroup(items, e.target.checked)}
                  />
                  <span className="font-medium">Select All</span>
                </label>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((p) => (
                  <label key={p.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={rolePerms.has(p.name)}
                      onChange={() => toggle(p.name)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{p.description || p.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{p.name}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden manager for creating new permissions if needed */}
      <div className="hidden">
        <PermissionManager />
      </div>
    </div>
  );
}
