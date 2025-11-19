import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import * as masters from '@/services/hr.masters.service';
import * as hr from '@/services/hr.service';
import * as leave from '@/services/hr.leave.service.js';

export default function LeaveApplication() {
  const [employees, setEmployees] = React.useState([]);
  const [leaveTypes, setLeaveTypes] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '', contact_during_leave: '' });

  React.useEffect(() => {
    hr.listEmployees().then(setEmployees);
    masters.listLeaveTypes().then(setLeaveTypes);
  }, []);

  const valid = () => form.employee_id && form.leave_type_id && form.start_date && form.end_date;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid()) return alert('Please fill all required fields');
    setSaving(true);
    try {
      await leave.apply(form);
      alert('Leave application submitted');
      setForm({ employee_id: '', leave_type_id: '', start_date: '', end_date: '', reason: '', contact_during_leave: '' });
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leave Application</h1>
      <Card>
        <CardHeader><div className="font-semibold">Apply for Leave</div></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Employee" value={form.employee_id} onChange={(e)=>setForm(f=>({...f, employee_id:e.target.value}))}
              options={[{ label:'Select', value:'' }, ...employees.map(e=>({ label:`${e.employee_id} - ${e.first_name} ${e.last_name}`, value:e.id }))]}
            />
            <Select label="Leave Type" value={form.leave_type_id} onChange={(e)=>setForm(f=>({...f, leave_type_id:e.target.value}))}
              options={[{ label:'Select', value:'' }, ...leaveTypes.map(t=>({ label:t.name, value:t.id }))]}
            />
            <Input label="Start Date" type="date" value={form.start_date} onChange={(e)=>setForm(f=>({...f, start_date:e.target.value}))} />
            <Input label="End Date" type="date" value={form.end_date} onChange={(e)=>setForm(f=>({...f, end_date:e.target.value}))} />
            <Input label="Reason" value={form.reason} onChange={(e)=>setForm(f=>({...f, reason:e.target.value}))} />
            <Input label="Contact During Leave" value={form.contact_during_leave} onChange={(e)=>setForm(f=>({...f, contact_during_leave:e.target.value}))} />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={saving}>Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
