import React from 'react';
import * as hr from '@/services/hr.service';
import * as att from '@/services/hr.attendance.service.js';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

export default function EmployeeAttendance() {
  const [employees, setEmployees] = React.useState([]);
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({ from: '', to: '', employee_id: '' });
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    time: '',
    activity: 'check_in',
    status: 'present',
    notes: '',
  });

  React.useEffect(() => { hr.listEmployees().then(setEmployees); }, []);

  const selectedEmployee = React.useMemo(
    () => employees.find((e) => e.id === form.employee_id) || null,
    [employees, form.employee_id]
  );

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const data = await att.report(params);
      setRecords(data);
    } finally { setLoading(false); }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.date || !form.time) return alert('Employee, date and time are required');
    setSaving(true);
    try {
      const dateTime = `${form.date}T${form.time}`;
      const payload = {
        employee_id: form.employee_id,
        date: form.date,
        check_in: form.activity === 'check_in' ? dateTime : undefined,
        check_out: form.activity === 'check_out' ? dateTime : undefined,
        status: form.status,
        notes: form.notes,
      };
      await att.mark(payload);
      alert('Attendance saved');
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const columns = [
    { key: 'sno', header: 'S.No', accessor: (_r, idx) => idx + 1 },
    { key: 'emp_code', header: 'Employee ID' },
    { key: 'device_id', header: 'Machine ID' },
    { key: 'name', header: 'Employee', accessor: (r) => `${r.first_name} ${r.last_name}` },
    { key: 'department', header: 'Department' },
    { key: 'designation', header: 'Designation' },
    { key: 'day', header: 'Day', accessor: (r) => (r.attendance_date ? new Date(r.attendance_date).toLocaleDateString(undefined, { weekday: 'long' }) : '') },
    { key: 'date', header: 'Date', accessor: (r) => r.attendance_date },
    { key: 'time', header: 'Time', accessor: (r) => r.check_in || r.check_out || '' },
    { key: 'activity', header: 'Activity', accessor: (r) => (r.check_in && !r.check_out ? 'Check In' : r.check_out && !r.check_in ? 'Check Out' : r.status || '') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employee Attendance</h1>
        <Button variant="secondary" onClick={load} disabled={loading}>Refresh</Button>
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
            <Input label="From Date" type="date" value={filters.from} onChange={(e)=>setFilters(f=>({...f, from:e.target.value}))} />
            <Input label="To Date" type="date" value={filters.to} onChange={(e)=>setFilters(f=>({...f, to:e.target.value}))} />
          </div>
        </CardHeader>
        <CardContent>
          <Table columns={columns} data={records} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="font-semibold">Manual Attendance Entry</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <form className="space-y-3 md:col-span-2" onSubmit={onSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Employee"
                  value={form.employee_id}
                  onChange={(e)=>setForm(f=>({...f, employee_id:e.target.value }))}
                  options={[{ label:'Select', value:'' }, ...employees.map(e=>({ label:`${e.employee_id} - ${e.first_name} ${e.last_name}`, value:e.id }))]}
                />
                <Input label="Employee ID" value={selectedEmployee?.employee_id || ''} readOnly />
                <Select
                  label="Activity"
                  value={form.activity}
                  onChange={(e)=>setForm(f=>({...f, activity:e.target.value }))}
                  options={[
                    { label:'Check In', value:'check_in' },
                    { label:'Check Out', value:'check_out' },
                  ]}
                />
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e)=>setForm(f=>({...f, status:e.target.value }))}
                  options={[
                    { label:'Present', value:'present' },
                    { label:'Absent', value:'absent' },
                    { label:'Late', value:'late' },
                  ]}
                />
                <Input label="Attendance Date" type="date" value={form.date} onChange={(e)=>setForm(f=>({...f, date:e.target.value }))} />
                <Input label="Attendance Time" type="time" value={form.time} onChange={(e)=>setForm(f=>({...f, time:e.target.value }))} />
                <Input label="Remark" value={form.notes} onChange={(e)=>setForm(f=>({...f, notes:e.target.value }))} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving}>Save</Button>
              </div>
            </form>

            <div className="border rounded-md p-4 bg-gray-50 md:col-span-1 text-sm space-y-1">
              <div className="font-semibold mb-2">Employee Info</div>
              <div><span className="font-medium">Employee ID:</span> {selectedEmployee?.employee_id || '-'}</div>
              <div><span className="font-medium">Employee:</span> {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : '-'}</div>
              <div><span className="font-medium">Department:</span> {selectedEmployee?.department_name || '-'}</div>
              <div><span className="font-medium">Designation:</span> {selectedEmployee?.designation_title || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
