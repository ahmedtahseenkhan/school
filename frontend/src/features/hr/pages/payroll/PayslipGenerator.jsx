import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import * as hr from '@/services/hr.service';
import * as payroll from '@/services/hr.payroll.service.js';

export default function PayslipGenerator() {
  const [employees, setEmployees] = React.useState([]);
  const [employeeId, setEmployeeId] = React.useState('');
  const [periodId, setPeriodId] = React.useState('');
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => { hr.listEmployees().then(setEmployees); }, []);

  const load = async () => {
    if (!employeeId) return alert('Select employee');
    setLoading(true);
    try {
      const res = await payroll.payslip(employeeId, periodId ? { period_id: periodId } : {});
      setData(res);
    } catch (e) {
      alert(e?.response?.data?.message || 'Payslip not found');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payslip</h1>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select label="Employee" value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)}
              options={[{ label:'Select', value:'' }, ...employees.map(e=>({ label:`${e.employee_id} - ${e.first_name} ${e.last_name}`, value:e.id }))]}
            />
            <Input label="Period ID (optional)" value={periodId} onChange={(e)=>setPeriodId(e.target.value)} />
            <div className="flex items-end"><Button variant="secondary" onClick={load} disabled={loading}>Load</Button></div>
          </div>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div className="text-sm text-gray-500">Select an employee and load the latest payslip.</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm">Payroll Period: {data.record?.payroll_period_id}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><div className="text-gray-500">Gross</div><div>{data.record?.gross_earnings}</div></div>
                <div><div className="text-gray-500">Deductions</div><div>{data.record?.total_deductions}</div></div>
                <div><div className="text-gray-500">Net</div><div>{data.record?.net_salary}</div></div>
              </div>
              <div className="border rounded-md">
                <div className="px-3 py-2 font-semibold bg-gray-50 dark:bg-gray-800">Details</div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {data.details?.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>{d.name} ({d.type})</div>
                      <div>{d.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => window.print()}>Print</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
