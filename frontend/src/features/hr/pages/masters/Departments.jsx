import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as masters from '@/services/hr.masters.service';

export default function DepartmentsPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', code: '', description: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await masters.listDepartments();
      setItems(data);
    } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    if (!q) return true; const s = (i.name + ' ' + (i.code||'') + ' ' + (i.description||'')).toLowerCase(); return s.includes(q.toLowerCase());
  });

  const startCreate = () => { setEditing(null); setForm({ name:'', code:'', description:'' }); setOpen(true); };
  const startEdit = (row) => { setEditing(row); setForm({ name: row.name||'', code: row.code||'', description: row.description||'' }); setOpen(true); };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name) return alert('Name is required');
    try {
      if (editing) await masters.updateDepartment(editing.id, form);
      else await masters.createDepartment(form);
      setOpen(false); setEditing(null); await load();
    } catch (err) { alert(err?.response?.data?.message || 'Save failed'); }
  };

  const onDelete = async (row) => {
    if (!confirm('Delete this department?')) return;
    await masters.deleteDepartment(row.id);
    await load();
  };

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'code', header: 'Code' },
    { key: 'description', header: 'Description' },
    { key: 'actions', header: 'Actions', accessor: (row) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Departments</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Manage departments</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : (
            <Table columns={columns} data={filtered} showSearch={false} />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={()=>{ setOpen(false); setEditing(null); }} title={editing ? 'Edit Department' : 'Add Department'}>
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Name" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} required />
            <Input label="Code" value={form.code} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))} />
          </div>
          <Input label="Description" value={form.description} onChange={(e)=>setForm(f=>({...f, description:e.target.value}))} />
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={()=>{ setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
