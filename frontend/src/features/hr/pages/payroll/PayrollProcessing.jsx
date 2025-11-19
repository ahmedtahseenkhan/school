import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import * as payroll from '@/services/hr.payroll.service.js';
import * as hr from '@/services/hr.service';

export default function PayrollProcessing() {
  const [employees, setEmployees] = React.useState([]);
  const [summary, setSummary] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ branch_id: '', period_name: '', start_date: '', end_date: '', payment_date: '' });

  React.useEffect(() => { hr.listEmployees().then(setEmployees); }, []);

  const process = async () => {
    if (!form.period_name || !form.start_date || !form.end_date) return alert('Fill period name, start and end dates');
    setSaving(true);
    try {
      const res = await payroll.process(form);
      const rep = await payroll.report({ period_id: res.period_id });
      setSummary({ ...res, ...rep });
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to process payroll');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payroll Processing</h1>
      <Card>
        <CardHeader><div className="font-semibold">Run Payroll Period</div></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input label="Period Name" value={form.period_name} onChange={(e)=>setForm(f=>({...f, period_name:e.target.value}))} />
            <Input label="Start Date" type="date" value={form.start_date} onChange={(e)=>setForm(f=>({...f, start_date:e.target.value}))} />
            <Input label="End Date" type="date" value={form.end_date} onChange={(e)=>setForm(f=>({...f, end_date:e.target.value}))} />
            <Input label="Payment Date" type="date" value={form.payment_date} onChange={(e)=>setForm(f=>({...f, payment_date:e.target.value}))} />
            <div className="flex items-end"><Button onClick={process} disabled={saving}>Process</Button></div>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader><div className="font-semibold">Summary</div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><div className="text-gray-500">Employees</div><div>{summary.employee_count ?? summary.processed}</div></div>
              <div><div className="text-gray-500">Gross</div><div>{summary.total_gross}</div></div>
              <div><div className="text-gray-500">Deductions</div><div>{summary.total_deductions}</div></div>
              <div><div className="text-gray-500">Net</div><div>{summary.total_net}</div></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
