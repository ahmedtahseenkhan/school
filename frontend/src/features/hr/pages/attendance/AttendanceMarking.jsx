import React from 'react';
import * as hr from '@/services/hr.service';
import * as att from '@/services/hr.attendance.service.js';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AttendanceMarking() {
  const [employees, setEmployees] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ employee_id: '', date: new Date().toISOString().slice(0,10), check_in: '', check_out: '', status: 'present', notes: '' });

  React.useEffect(() => { hr.listEmployees().then(setEmployees); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id) return alert('Select employee');
    setSaving(true);
    try {
      await att.mark(form);
      alert('Attendance saved');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Attendance Marking</h1>
      <Card>
        <CardHeader><div className="font-semibold">Mark Attendance</div></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select label="Employee" value={form.employee_id} onChange={(e)=>setForm(f=>({...f, employee_id:e.target.value}))}
              options={[{ label: 'Select', value: '' }, ...employees.map(e=>({ label: `${e.employee_id} - ${e.first_name} ${e.last_name}`, value: e.id }))]}
            />
            <Input label="Date" type="date" value={form.date} onChange={(e)=>setForm(f=>({...f, date: e.target.value}))} />
            <Select label="Status" value={form.status} onChange={(e)=>setForm(f=>({...f, status: e.target.value}))}
              options={[{label:'Present', value:'present'},{label:'Absent',value:'absent'},{label:'Late',value:'late'}]}
            />
            <Input label="Check-in" type="time" value={form.check_in} onChange={(e)=>setForm(f=>({...f, check_in: e.target.value}))} />
            <Input label="Check-out" type="time" value={form.check_out} onChange={(e)=>setForm(f=>({...f, check_out: e.target.value}))} />
            <Input label="Notes" value={form.notes} onChange={(e)=>setForm(f=>({...f, notes: e.target.value}))} />
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={saving}>Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
