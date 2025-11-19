import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as masters from '@/services/hr.masters.service';

export default function HolidayTypesPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ code: '', name: '', description: '', color: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await masters.listHolidayTypes();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    if (!q) return true;
    const s = (`${i.code || ''} ${i.name || ''} ${i.description || ''}`).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const startCreate = () => {
    setEditing(null);
    setForm({ code: '', name: '', description: '', color: '' });
    setOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({ code: row.code || '', name: row.name || '', description: row.description || '', color: row.color || '' });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name) return alert('Code and Name are required');
    try {
      if (editing) await masters.updateHolidayType(editing.id, form);
      else await masters.createHolidayType(form);
      setOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (row) => {
    if (!confirm('Delete this holiday type?')) return;
    await masters.deleteHolidayType(row.id);
    await load();
  };

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Holiday Type', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'color',
      header: 'Color',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.color && <span className="inline-block h-4 w-8 rounded" style={{ backgroundColor: row.color }} />}
          <span className="text-xs text-gray-500">{row.color || '-'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Holiday Types</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Define the types of holidays used in calendars and attendance.</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center">
              <Spinner className="w-6 h-6 text-blue-600" />
            </div>
          ) : (
            <Table columns={columns} data={filtered} showSearch={false} />
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Holiday Type' : 'Add Holiday Type'}
      >
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            <Input label="Holiday Type" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Color Code"
            placeholder="#000000 or CSS color"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
