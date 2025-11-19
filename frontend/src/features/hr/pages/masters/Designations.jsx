import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as masters from '@/services/hr.masters.service';

export default function DesignationsPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ title: '', description: '', hierarchy_level: 0, grade: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await masters.listDesignations();
      setItems(data);
    } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    if (!q) return true; const s = ((i.title||'') + ' ' + (i.grade||'') + ' ' + (i.description||'')).toLowerCase(); return s.includes(q.toLowerCase());
  });

  const startCreate = () => { setEditing(null); setForm({ title:'', description:'', hierarchy_level:0, grade:'' }); setOpen(true); };
  const startEdit = (row) => { setEditing(row); setForm({ title: row.title||'', description: row.description||'', hierarchy_level: row.hierarchy_level||0, grade: row.grade||'' }); setOpen(true); };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.title) return alert('Title is required');
    try {
      if (editing) await masters.updateDesignation(editing.id, form);
      else await masters.createDesignation(form);
      setOpen(false); setEditing(null); await load();
    } catch (err) { alert(err?.response?.data?.message || 'Save failed'); }
  };

  const onDelete = async (row) => {
    if (!confirm('Delete this designation?')) return;
    await masters.deleteDesignation(row.id);
    await load();
  };

  const columns = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'grade', header: 'Grade' },
    { key: 'hierarchy_level', header: 'Level' },
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
        <h1 className="text-2xl font-bold">Designations</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Manage designations</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : (
            <Table columns={columns} data={filtered} showSearch={false} />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={()=>{ setOpen(false); setEditing(null); }} title={editing ? 'Edit Designation' : 'Add Designation'}>
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Title" value={form.title} onChange={(e)=>setForm(f=>({...f, title:e.target.value}))} required />
            <Input label="Grade" value={form.grade} onChange={(e)=>setForm(f=>({...f, grade:e.target.value}))} />
          </div>
          <Input label="Hierarchy Level" type="number" value={form.hierarchy_level} onChange={(e)=>setForm(f=>({...f, hierarchy_level: Number(e.target.value||0)}))} />
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
