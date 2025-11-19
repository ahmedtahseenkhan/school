import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import * as hr from '@/services/hr.service';
import * as masters from '@/services/hr.masters.service';
import * as structures from '@/services/hr.structures.service';

export default function LeaveQuotaAllocation() {
  const [employees, setEmployees] = React.useState([]);
  const [leaveTypes, setLeaveTypes] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [filters, setFilters] = React.useState({ employee_id: '', year: String(new Date().getFullYear()) });
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ employee_id: '', leave_type_id: '', year: String(new Date().getFullYear()), total_days: '', carried_forward_days: 0 });

  React.useEffect(() => {
    hr.listEmployees().then(setEmployees);
    masters.listLeaveTypes().then(setLeaveTypes);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const data = await structures.listLeaveQuotas(params);
      setItems(data);
    } finally { setLoading(false); }
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ employee_id: '', leave_type_id: '', year: String(new Date().getFullYear()), total_days: '', carried_forward_days: 0 });
    setOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({
      employee_id: row.employee_id,
      leave_type_id: row.leave_type_id,
      year: String(row.year),
      total_days: row.total_days ?? '',
      carried_forward_days: row.carried_forward_days ?? 0,
    });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.leave_type_id || !form.year) return alert('Employee, Leave Type and Year are required');
    const payload = {
      employee_id: form.employee_id,
      leave_type_id: form.leave_type_id,
      year: parseInt(form.year, 10),
      total_days: form.total_days ? Number(form.total_days) : 0,
      carried_forward_days: form.carried_forward_days ? Number(form.carried_forward_days) : 0,
      remaining_days: form.total_days ? Number(form.total_days) : 0,
      used_days: 0,
    };
    try {
      if (editing) await structures.updateLeaveQuota(editing.id, payload);
      else await structures.createLeaveQuota(payload);
      setOpen(false); setEditing(null); await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (row) => {
    if (!confirm('Delete this quota?')) return;
    await structures.deleteLeaveQuota(row.id);
    await load();
  };

  const columns = [
    { key: 'emp', header: 'Employee', accessor: (r) => `${r.employee_id ? '' : ''}${r.first_name ? '' : ''}` },
    { key: 'employee', header: 'Employee', accessor: (r) => `${r.first_name} ${r.last_name}` },
    { key: 'year', header: 'Year' },
    { key: 'leave_type', header: 'Leave Type' },
    { key: 'total_days', header: 'Total' },
    { key: 'used_days', header: 'Used' },
    { key: 'remaining_days', header: 'Remaining' },
    { key: 'carried_forward_days', header: 'Carry Fwd' },
    { key: 'actions', header: 'Actions', accessor: (row) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave Quota Allocation</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={load} disabled={loading}>Refresh</Button>
          <Button onClick={startCreate}>Add Quota</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              label="Employee"
              value={filters.employee_id}
              onChange={(e)=>setFilters(f=>({...f, employee_id:e.target.value}))}
              options={[{ label:'All', value:'' }, ...employees.map(e=>({ label:`${e.employee_id} - ${e.first_name} ${e.last_name}`, value:e.id }))]}
            />
            <Input label="Year" type="number" value={filters.year} onChange={(e)=>setFilters(f=>({...f, year:e.target.value}))} />
          </div>
        </CardHeader>
        <CardContent>
          <Table columns={columns} data={items} />
        </CardContent>
      </Card>

      <Modal open={open} onClose={()=>{ setOpen(false); setEditing(null); }} title={editing ? 'Edit Quota' : 'Add Quota'}>
        <form className="space-y-4" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Employee"
              value={form.employee_id}
              onChange={(e)=>setForm(f=>({...f, employee_id:e.target.value}))}
              options={[{ label:'Select', value:'' }, ...employees.map(e=>({ label:`${e.employee_id} - ${e.first_name} ${e.last_name}`, value:e.id }))]}
            />
            <Select
              label="Leave Type"
              value={form.leave_type_id}
              onChange={(e)=>setForm(f=>({...f, leave_type_id:e.target.value}))}
              options={[{ label:'Select', value:'' }, ...leaveTypes.map(t=>({ label:t.name, value:t.id }))]}
            />
            <Input label="Year" type="number" value={form.year} onChange={(e)=>setForm(f=>({...f, year:e.target.value}))} />
            <Input label="Total Days" type="number" value={form.total_days} onChange={(e)=>setForm(f=>({...f, total_days:e.target.value}))} />
            <Input label="Carry Forward Days" type="number" value={form.carried_forward_days} onChange={(e)=>setForm(f=>({...f, carried_forward_days:e.target.value}))} />
          </div>
          <div className="flex items-center justify-end gap-2 border-t pt-3 mt-2">
            <Button type="button" variant="ghost" onClick={()=>{ setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
