import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import * as hr from '@/services/hr.service';
import * as leave from '@/services/hr.leave.service.js';

export default function LeaveBalance() {
  const [employees, setEmployees] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [filters, setFilters] = React.useState({ employee_id: '', year: String(new Date().getFullYear()) });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => { hr.listEmployees().then(setEmployees); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const data = await leave.balance(params);
      setItems(data);
    } finally { setLoading(false); }
  };

  const exportCSV = () => {
    const headers = ['Emp Code','Name','Year','Leave Type','Total','Used','Remaining','Carry Fwd'];
    const rows = items.map((r) => [r.emp_code, `${r.first_name} ${r.last_name}`, r.year, r.leave_type, r.total_days, r.used_days, r.remaining_days, r.carried_forward_days]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leave-balance.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'emp', header: 'Employee', accessor: (r) => `${r.emp_code} - ${r.first_name} ${r.last_name}` },
    { key: 'year', header: 'Year', sortable: true },
    { key: 'leave_type', header: 'Leave Type', sortable: true },
    { key: 'total_days', header: 'Total' },
    { key: 'used_days', header: 'Used' },
    { key: 'remaining_days', header: 'Remaining' },
    { key: 'carried_forward_days', header: 'Carry Fwd' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave Balance</h1>
        <Button variant="secondary" onClick={exportCSV} disabled={!items.length}>Export</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select label="Employee" value={filters.employee_id} onChange={(e)=>setFilters(f=>({...f, employee_id:e.target.value}))}
              options={[{ label:'All', value:'' }, ...employees.map(e=>({ label:`${e.employee_id} - ${e.first_name} ${e.last_name}`, value:e.id }))]}
            />
            <Input label="Year" type="number" value={filters.year} onChange={(e)=>setFilters(f=>({...f, year:e.target.value}))} />
            <div className="flex items-end"><Button variant="secondary" onClick={load} disabled={loading}>Apply</Button></div>
          </div>
        </CardHeader>
        <CardContent>
          <Table columns={columns} data={items} />
        </CardContent>
      </Card>
    </div>
  );
}
