import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import * as masters from '@/services/hr.masters.service';

export default function ShiftsPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ code: '', name: '', shift_type: 'time_based', start_time: '', end_time: '', break_duration_minutes: 60, is_active: true });

  const load = async () => {
    setLoading(true);
    try { setItems(await masters.listShifts()); } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    if (!q) return true; const s = (i.name + ' ' + (i.start_time||'') + ' ' + (i.end_time||'')).toLowerCase(); return s.includes(q.toLowerCase());
  });

  const startCreate = () => { setEditing(null); setForm({ code:'', name:'', shift_type:'time_based', start_time:'', end_time:'', break_duration_minutes:60, is_active:true }); setOpen(true); };
  const startEdit = (row) => { setEditing(row); setForm({ code: row.code||'', name: row.name||'', shift_type: row.shift_type||'time_based', start_time: row.start_time||'', end_time: row.end_time||'', break_duration_minutes: row.break_duration_minutes||60, is_active: !!row.is_active }); setOpen(true); };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.start_time || !form.end_time) return alert('Name, Start and End time are required');
    try {
      if (editing) await masters.updateShift(editing.id, form);
      else await masters.createShift(form);
      setOpen(false); setEditing(null); await load();
    } catch (err) { alert(err?.response?.data?.message || 'Save failed'); }
  };

  const onDelete = async (row) => { if (!confirm('Delete this shift?')) return; await masters.deleteShift(row.id); await load(); };

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Shift Name', sortable: true },
    { key: 'shift_type', header: 'Shift Type', accessor: (r)=> r.shift_type === 'time_based' ? 'Time Based' : (r.shift_type || '') },
    { key: 'start_time', header: 'Start' },
    { key: 'end_time', header: 'End' },
    { key: 'break_duration_minutes', header: 'Break (min)' },
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
        <h1 className="text-2xl font-bold">Shifts</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader><div className="text-sm text-gray-500">Manage shifts</div></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : (
            <Table columns={columns} data={filtered} showSearch={false} />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={()=>{ setOpen(false); setEditing(null); }} title={editing ? 'Edit Shift' : 'Add Shift'}>
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input label="Code" value={form.code} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))} />
            <Input label="Shift Name" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} required />
            <Select
              label="Shift Type"
              value={form.shift_type}
              onChange={(e)=>setForm(f=>({...f, shift_type:e.target.value}))}
              options={[{ label: 'Time Based', value: 'time_based' }]}
            />
            <Input label="Shift Duration (minutes)" type="number" value={form.break_duration_minutes} onChange={(e)=>setForm(f=>({...f, break_duration_minutes:Number(e.target.value||0)}))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Start Time" type="time" value={form.start_time} onChange={(e)=>setForm(f=>({...f, start_time:e.target.value}))} required />
            <Input label="End Time" type="time" value={form.end_time} onChange={(e)=>setForm(f=>({...f, end_time:e.target.value}))} required />
            <Input label="Break (minutes)" type="number" value={form.break_duration_minutes} onChange={(e)=>setForm(f=>({...f, break_duration_minutes:Number(e.target.value||0)}))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Active" value={form.is_active ? 'Yes' : 'No'} onChange={()=>setForm(f=>({...f, is_active: !f.is_active}))} />
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
