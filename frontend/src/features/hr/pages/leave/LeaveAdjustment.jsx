import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import * as hr from '@/services/hr.service';
import * as masters from '@/services/hr.masters.service';
import * as leave from '@/services/hr.leave.service.js';

export default function LeaveAdjustment() {
  const [employees, setEmployees] = React.useState([]);
  const [leaveTypes, setLeaveTypes] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [filters, setFilters] = React.useState({ employee_id: '', year: String(new Date().getFullYear()) });
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ employee_id: '', leave_type_id: '', year: String(new Date().getFullYear()), adjustment_days: '', reason: '', reference_no: '' });

  React.useEffect(() => {
    hr.listEmployees().then(setEmployees);
    masters.listLeaveTypes().then(setLeaveTypes);
  }, []);

  const load = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
    const data = await leave.listAdjustments(params);
    setItems(data);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.leave_type_id || !form.year || !form.adjustment_days) return alert('All required fields must be filled');
    setSaving(true);
    try {
      await leave.createAdjustment({
        employee_id: form.employee_id,
        leave_type_id: form.leave_type_id,
        year: parseInt(form.year, 10),
        adjustment_days: Number(form.adjustment_days),
        reason: form.reason,
        reference_no: form.reference_no,
      });
      setForm({ employee_id: '', leave_type_id: '', year: String(new Date().getFullYear()), adjustment_days: '', reason: '', reference_no: '' });
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const columns = [
    { key: 'emp', header: 'Employee', accessor: (r) => `${r.emp_code} - ${r.first_name} ${r.last_name}` },
    { key: 'year', header: 'Year' },
    { key: 'leave_type', header: 'Leave Type' },
    { key: 'adjustment_days', header: 'Days' },
    { key: 'reason', header: 'Reason' },
    { key: 'reference_no', header: 'Reference' },
    { key: 'created_at', header: 'Created At' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave Adjustment</h1>
        <Button variant="secondary" onClick={load}>Refresh</Button>
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

      <Card>
        <CardHeader>
          <div className="font-semibold">New Adjustment</div>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={onSubmit}>
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
            <Input label="Days (+/-)" type="number" value={form.adjustment_days} onChange={(e)=>setForm(f=>({...f, adjustment_days:e.target.value}))} />
            <Input label="Reason" value={form.reason} onChange={(e)=>setForm(f=>({...f, reason:e.target.value}))} />
            <Input label="Reference No" value={form.reference_no} onChange={(e)=>setForm(f=>({...f, reference_no:e.target.value}))} />
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={saving}>Save Adjustment</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
