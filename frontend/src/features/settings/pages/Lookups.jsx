import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as lookups from '@/services/hr.lookups.service.js';

const TYPES = [
  { value: 'title', label: 'Titles' },
  { value: 'gender', label: 'Genders' },
  { value: 'marital_status', label: 'Marital Status' },
  { value: 'blood_group', label: 'Blood Groups' },
  { value: 'nationality', label: 'Nationalities' },
  { value: 'employment_type', label: 'Employment Types' },
  { value: 'employee_category', label: 'Employee Categories' },
  { value: 'employment_status', label: 'Employment Statuses' },
  { value: 'bank_account_type', label: 'Bank Account Types' },
  { value: 'payment_method', label: 'Payment Methods' },
  { value: 'payment_frequency', label: 'Payment Frequencies' },
  { value: 'relationship', label: 'Relationships' },
  { value: 'qualification_type', label: 'Qualification Types' },
  { value: 'skill_proficiency', label: 'Skill Proficiency' },
  { value: 'document_type', label: 'Document Types' },
  { value: 'grade_band', label: 'Grade Bands' },
  // Setup - Academic & misc
  { value: 'academic_register', label: 'Academic Registers' },
  { value: 'academic_year', label: 'Academic Years' },
  { value: 'event_type', label: 'Event Types' },
  { value: 'occupation', label: 'Occupations' },
  { value: 'language', label: 'Languages' },
  { value: 'color', label: 'Colors' },
  { value: 'additional_registration', label: 'Additional Registrations' },
];

export default function LookupsPage() {
  const [type, setType] = React.useState('title');
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', code: '', description: '', is_active: true });
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await lookups.list(type);
      setItems(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  React.useEffect(() => { setPage(1); load(); }, [type]);

  const filtered = items.filter(i => {
    if (!q) return true;
    const s = (i.name + ' ' + i.code + ' ' + (i.description||'')).toLowerCase();
    return s.includes(q.toLowerCase());
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'is_active', header: 'Active', accessor: (r)=> r.is_active ? 'Yes' : 'No' },
    { key: 'actions', header: 'Actions', accessor: (row) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Delete</Button>
      </div>
    )}
  ];

  const startCreate = () => { setEditing(null); setForm({ name:'', code:'', description:'', is_active:true }); setOpen(true); };
  const startEdit = (row) => { setEditing(row); setForm({ name: row.name || '', code: row.code || '', description: row.description || '', is_active: !!row.is_active }); setOpen(true); };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      if (!form.name || !form.code) return alert('Code and Name are required');
      if (editing) await lookups.update(type, editing.id, { name: form.name, code: form.code, description: form.description, is_active: form.is_active });
      else await lookups.create(type, { name: form.name, code: form.code, description: form.description, is_active: form.is_active });
      setOpen(false); setEditing(null); await load();
    } catch (e2) {
      alert(e2?.response?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (row) => {
    if (!confirm('Delete this item?')) return;
    try {
      await lookups.remove(type, row.id);
      await load();
    } catch (e) { alert('Delete failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lookups</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select label="Type" value={type} onChange={(e)=> setType(e.target.value)} options={TYPES.map(t=>({ label:t.label, value:t.value }))} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            <>
              <Table columns={columns} data={paged} showSearch={false} />
              <div className="flex items-center justify-between mt-3 text-sm">
                <div>Page {page} of {totalPages} • {filtered.length} items</div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
                  <Button variant="secondary" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={()=>{ setOpen(false); setEditing(null); }} title={editing ? 'Edit Item' : 'Add Item'}>
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Code" value={form.code} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))} required />
            <Input label="Name" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} required />
          </div>
          <Input label="Description" value={form.description} onChange={(e)=>setForm(f=>({...f, description:e.target.value}))} />
          <Select label="Active" value={form.is_active ? 'yes':'no'} onChange={(e)=>setForm(f=>({...f, is_active: e.target.value==='yes'}))} options={[{label:'Yes', value:'yes'},{label:'No', value:'no'}]} />
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={()=>{ setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
