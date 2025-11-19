import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import * as masters from '@/services/hr.masters.service';

export default function LeaveTypesPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    name: 'Annual Leave',
    code: '',
    description: '',
    max_days_per_year: '',
    carry_forward_days: 0,
    requires_medical_certificate: false,
    color: '',
    leave_unit: 'days',
    leaves_per_period: '',
    renew_on: 'Every calendar year',
    max_avail_unit: 'days',
    max_avail: '',
    encashment_allowed: false,
    marital_status_filter: '',
    gender_filter: '',
    entitle_on: '',
    accrual_unit: '',
    allow_in_probation: false,
    quota_validate: false,
    paid_leave: true,
    request_before_days: '',
    request_unit: 'days',
    late_adjustable: false,
    include_holidays: false,
    early_dep_adjustable: false,
  });

  const load = async () => {
    setLoading(true);
    try { setItems(await masters.listLeaveTypes()); } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    if (!q) return true; const s = (i.name + ' ' + (i.code||'') + ' ' + (i.description||'')).toLowerCase(); return s.includes(q.toLowerCase());
  });

  const startCreate = () => {
    setEditing(null);
    setForm({
      name: 'Annual Leave',
      code: '',
      description: '',
      max_days_per_year: '',
      carry_forward_days: 0,
      requires_medical_certificate: false,
      color: '',
      leave_unit: 'days',
      leaves_per_period: '',
      renew_on: 'Every calendar year',
      max_avail_unit: 'days',
      max_avail: '',
      encashment_allowed: false,
      marital_status_filter: '',
      gender_filter: '',
      entitle_on: '',
      accrual_unit: '',
      allow_in_probation: false,
      quota_validate: false,
      paid_leave: true,
      request_before_days: '',
      request_unit: 'days',
      late_adjustable: false,
      include_holidays: false,
      early_dep_adjustable: false,
    });
    setOpen(true);
  };
  const startEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
      max_days_per_year: row.max_days_per_year || '',
      carry_forward_days: row.carry_forward_days || 0,
      requires_medical_certificate: !!row.requires_medical_certificate,
      color: row.color || '',
      leave_unit: row.leave_unit || 'days',
      leaves_per_period: row.leaves_per_period || '',
      renew_on: row.renew_on || 'Every calendar year',
      max_avail_unit: row.max_avail_unit || 'days',
      max_avail: row.max_avail || '',
      encashment_allowed: !!row.encashment_allowed,
      marital_status_filter: row.marital_status_filter || '',
      gender_filter: row.gender_filter || '',
      entitle_on: row.entitle_on || '',
      accrual_unit: row.accrual_unit || '',
      allow_in_probation: !!row.allow_in_probation,
      quota_validate: !!row.quota_validate,
      paid_leave: row.paid_leave !== undefined ? !!row.paid_leave : true,
      request_before_days: row.request_before_days || '',
      request_unit: row.request_unit || 'days',
      late_adjustable: !!row.late_adjustable,
      include_holidays: !!row.include_holidays,
      early_dep_adjustable: !!row.early_dep_adjustable,
    });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return alert('Name and Code are required');
    try {
      if (editing) await masters.updateLeaveType(editing.id, form);
      else await masters.createLeaveType(form);
      setOpen(false); setEditing(null); await load();
    } catch (err) { alert(err?.response?.data?.message || 'Save failed'); }
  };

  const onDelete = async (row) => { if (!confirm('Delete this leave type?')) return; await masters.deleteLeaveType(row.id); await load(); };

  const columns = [
    { key: 'name', header: 'Leave Type', sortable: true },
    { key: 'code', header: 'Code' },
    { key: 'leave_unit', header: 'Unit', accessor: (r)=> r.leave_unit || 'days' },
    { key: 'leaves_per_period', header: 'Leaves', accessor: (r)=> r.leaves_per_period ?? r.max_days_per_year },
    { key: 'renew_on', header: 'Renew On', accessor: (r)=> r.renew_on || 'Every calendar year' },
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
        <h1 className="text-2xl font-bold">Leave Types</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader><div className="text-sm text-gray-500">Manage leave types</div></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : (
            <Table columns={columns} data={filtered} showSearch={false} />
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={()=>{ setOpen(false); setEditing(null); }}
        title={editing ? 'Edit Leave Type' : 'Add Leave Type'}
        className="max-w-5xl"
      >
        <form className="space-y-4" onSubmit={onSave}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input label="Code" value={form.code} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))} required />
            <Select
              label="Leave Type"
              value={form.name}
              onChange={(e)=>setForm(f=>({...f, name:e.target.value}))}
              options={[
                { label: 'Annual Leave', value: 'Annual Leave' },
                { label: 'Casual Leave', value: 'Casual Leave' },
                { label: 'Sick Leave', value: 'Sick Leave' },
                { label: 'Emergency Leave', value: 'Emergency Leave' },
                { label: 'Maternity Leave', value: 'Maternity Leave' },
                { label: 'Exam Leave', value: 'Exam Leave' },
              ]}
            />
            <Select
              label="Leave Unit"
              value={form.leave_unit}
              onChange={(e)=>setForm(f=>({...f, leave_unit:e.target.value}))}
              options={[
                { label: 'Days', value: 'days' },
                { label: 'Hours', value: 'hours' },
              ]}
            />
            <Input label="Leaves" type="number" value={form.leaves_per_period} onChange={(e)=>setForm(f=>({...f, leaves_per_period:e.target.value}))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              label="Renew On"
              value={form.renew_on}
              onChange={(e)=>setForm(f=>({...f, renew_on:e.target.value}))}
              options={[
                { label: 'Every calendar year', value: 'Every calendar year' },
                { label: 'Joining anniversary', value: 'Joining anniversary' },
              ]}
            />
            <Input label="Color" value={form.color} onChange={(e)=>setForm(f=>({...f, color:e.target.value}))} />
            <Input label="Description" value={form.description} onChange={(e)=>setForm(f=>({...f, description:e.target.value}))} />
          </div>

          {/* Policy */}
          <div className="border-t pt-3 mt-2">
            <div className="text-sm font-semibold mb-2">Policy</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input label="Max Avail Unit" value={form.max_avail_unit} onChange={(e)=>setForm(f=>({...f, max_avail_unit:e.target.value}))} />
              <Input label="Max Avail" type="number" value={form.max_avail} onChange={(e)=>setForm(f=>({...f, max_avail:e.target.value}))} />
              <Input label="Carry Forward Days" type="number" value={form.carry_forward_days} onChange={(e)=>setForm(f=>({...f, carry_forward_days:Number(e.target.value||0)}))} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.encashment_allowed} onChange={(e)=>setForm(f=>({...f, encashment_allowed:e.target.checked}))} />
                <span>Encashment Allowed</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
              <Input label="Marital Status" value={form.marital_status_filter} onChange={(e)=>setForm(f=>({...f, marital_status_filter:e.target.value}))} />
              <Input label="Gender" value={form.gender_filter} onChange={(e)=>setForm(f=>({...f, gender_filter:e.target.value}))} />
              <Input label="Max Days/Year" type="number" value={form.max_days_per_year} onChange={(e)=>setForm(f=>({...f, max_days_per_year:e.target.value}))} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.requires_medical_certificate} onChange={(e)=>setForm(f=>({...f, requires_medical_certificate:e.target.checked}))} />
                <span>Medical Certificate Required</span>
              </label>
            </div>
          </div>

          {/* Entitlement Policy */}
          <div className="border-t pt-3 mt-2">
            <div className="text-sm font-semibold mb-2">Leave Entitle Policy</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Entitle On" value={form.entitle_on} onChange={(e)=>setForm(f=>({...f, entitle_on:e.target.value}))} />
              <Input label="Accrual Unit" value={form.accrual_unit} onChange={(e)=>setForm(f=>({...f, accrual_unit:e.target.value}))} />
              <Input label="Leaves (info only)" value={form.leaves_per_period} onChange={(e)=>setForm(f=>({...f, leaves_per_period:e.target.value}))} />
            </div>
          </div>

          {/* Restrictions */}
          <div className="border-t pt-3 mt-2">
            <div className="text-sm font-semibold mb-2">Restrictions</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
              <Input label="Request Before (days)" type="number" value={form.request_before_days} onChange={(e)=>setForm(f=>({...f, request_before_days:e.target.value}))} />
              <Select
                label="Request Unit"
                value={form.request_unit}
                onChange={(e)=>setForm(f=>({...f, request_unit:e.target.value}))}
                options={[
                  { label: 'Days', value: 'days' },
                  { label: 'Hours', value: 'hours' },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.allow_in_probation} onChange={(e)=>setForm(f=>({...f, allow_in_probation:e.target.checked}))} />
                <span>Allow in Probation</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.quota_validate} onChange={(e)=>setForm(f=>({...f, quota_validate:e.target.checked}))} />
                <span>Quota Validate</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.paid_leave} onChange={(e)=>setForm(f=>({...f, paid_leave:e.target.checked}))} />
                <span>Paid Leave</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.late_adjustable} onChange={(e)=>setForm(f=>({...f, late_adjustable:e.target.checked}))} />
                <span>Late Adjustable</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.include_holidays} onChange={(e)=>setForm(f=>({...f, include_holidays:e.target.checked}))} />
                <span>Include Holidays</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.early_dep_adjustable} onChange={(e)=>setForm(f=>({...f, early_dep_adjustable:e.target.checked}))} />
                <span>Early Departure Adjustable</span>
              </label>
            </div>
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
