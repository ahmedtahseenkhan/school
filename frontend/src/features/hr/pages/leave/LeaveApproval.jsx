import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import * as hr from '@/services/hr.service';
import * as leave from '@/services/hr.leave.service.js';

export default function LeaveApproval() {
  const [employees, setEmployees] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({ employee_id: '', status: 'pending', from: '', to: '' });

  React.useEffect(() => { hr.listEmployees().then(setEmployees); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const data = await leave.listApplications(params);
      setItems(data);
    } finally { setLoading(false); }
  };

  const act = async (id, status) => {
    await leave.approve(id, status);
    await load();
  };

  const columns = [
    { key: 'applied', header: 'Dates', accessor: (r) => `${r.start_date} → ${r.end_date}` },
    { key: 'emp', header: 'Employee', accessor: (r) => `${r.emp_code} - ${r.first_name} ${r.last_name}` },
    { key: 'leave_type', header: 'Type' },
    { key: 'total_days', header: 'Days' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions', accessor: (r) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => act(r.id, 'approved')} disabled={r.status !== 'pending'}>Approve</Button>
        <Button size="sm" variant="danger" onClick={() => act(r.id, 'rejected')} disabled={r.status !== 'pending'}>Reject</Button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave Approval</h1>
        <Button variant="secondary" onClick={load} disabled={loading}>Refresh</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Select label="Employee" value={filters.employee_id} onChange={(e)=>setFilters(f=>({...f, employee_id:e.target.value}))}
              options={[{ label:'All', value:'' }, ...employees.map(e=>({ label:`${e.employee_id} - ${e.first_name} ${e.last_name}`, value:e.id }))]}
            />
            <Select label="Status" value={filters.status} onChange={(e)=>setFilters(f=>({...f, status:e.target.value}))}
              options={[{ label:'All', value:'' }, { label:'pending', value:'pending' }, { label:'approved', value:'approved' }, { label:'rejected', value:'rejected' }]}
            />
            <Input label="From" type="date" value={filters.from} onChange={(e)=>setFilters(f=>({...f, from:e.target.value}))} />
            <Input label="To" type="date" value={filters.to} onChange={(e)=>setFilters(f=>({...f, to:e.target.value}))} />
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
