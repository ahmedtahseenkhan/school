import React from 'react';
import * as rbac from '@/services/rbac.service.js';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';

export default function ModulesManager() {
  const [modules, setModules] = React.useState([]);
  const [saving, setSaving] = React.useState(false);

  const load = () => rbac.listModules().then(setModules);
  React.useEffect(() => { load(); }, []);

  const toggle = async (slug, current) => {
    setSaving(true);
    try {
      await rbac.setModuleEnabled(slug, !current);
      await load();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Modules</h1>
      <Card>
        <CardHeader>
          <div className="font-semibold">Enable/Disable Modules</div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {modules.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.slug}</div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={!!m.is_enabled} onChange={() => toggle(m.slug, !!m.is_enabled)} disabled={saving} />
                  <span>{m.is_enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
