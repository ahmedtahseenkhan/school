import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as masters from '@/services/hr.masters.service';

export default function SalaryComponentsPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', type: 'earning', calculation_type: 'fixed', is_taxable: true, is_active: true });

  const load = async () => {
    setLoading(true);
    try { setItems(await masters.listSalaryComponents()); } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    if (!q) return true; const s = (i.name + ' ' + (i.type||'') + ' ' + (i.calculation_type||'')).toLowerCase(); return s.includes(q.toLowerCase());
  });

  const startCreate = () => { setEditing(null); setForm({ name:'', type:'earning', calculation_type:'fixed', is_taxable:true, is_active:true }); setOpen(true); };
  const startEdit = (row) => { setEditing(row); setForm({ name: row.name||'', type: row.type||'earning', calculation_type: row.calculation_type||'fixed', is_taxable: !!row.is_taxable, is_active: !!row.is_active }); setOpen(true); };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name) return alert('Name is required');
    try {
      if (editing) await masters.updateSalaryComponent(editing.id, form);
      else await masters.createSalaryComponent(form);
      setOpen(false); setEditing(null); await load();
    } catch (err) { alert(err?.response?.data?.message || 'Save failed'); }
  };

  const onDelete = async (row) => { if (!confirm('Delete this component?')) return; await masters.deleteSalaryComponent(row.id); await load(); };

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'type', header: 'Type' },
    { key: 'calculation_type', header: 'Calculation' },
    { key: 'is_taxable', header: 'Taxable', accessor: (r)=> r.is_taxable ? 'Yes' : 'No' },
    { key: 'is_active', header: 'Active', accessor: (r)=> r.is_active ? 'Yes' : 'No' },
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
        <h1 className="text-2xl font-bold">Salary Components</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader><div className="text-sm text-gray-500">Manage salary components</div></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : (
            <Table columns={columns} data={filtered} showSearch={false} />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={()=>{ setOpen(false); setEditing(null); }} title={editing ? 'Edit Component' : 'Add Component'}>
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Name" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} required />
            <select className="border rounded px-2 py-2 text-sm" value={form.type} onChange={(e)=>setForm(f=>({...f, type:e.target.value}))}>
              <option value="earning">earning</option>
              <option value="deduction">deduction</option>
            </select>
            <select className="border rounded px-2 py-2 text-sm" value={form.calculation_type} onChange={(e)=>setForm(f=>({...f, calculation_type:e.target.value}))}>
              <option value="fixed">fixed</option>
              <option value="percentage">percentage</option>
              <option value="variable">variable</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select className="border rounded px-2 py-2 text-sm" value={form.is_taxable ? 'yes' : 'no'} onChange={(e)=>setForm(f=>({...f, is_taxable: e.target.value === 'yes'}))}>
              <option value="yes">Taxable: Yes</option>
              <option value="no">Taxable: No</option>
            </select>
            <select className="border rounded px-2 py-2 text-sm" value={form.is_active ? 'yes' : 'no'} onChange={(e)=>setForm(f=>({...f, is_active: e.target.value === 'yes'}))}>
              <option value="yes">Active: Yes</option>
              <option value="no">Active: No</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={()=>{ setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
