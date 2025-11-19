import React from 'react';
import * as hr from '@/services/hr.service';
import * as att from '@/services/hr.attendance.service.js';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

export default function RegularizationRequests() {
  const [employees, setEmployees] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({ from: '', to: '', employee_id: '', status: 'pending' });

  React.useEffect(() => { hr.listEmployees().then(setEmployees); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const data = await att.listRegularization(params);
      setItems(data);
    } finally { setLoading(false); }
  };

  const act = async (id, action) => {
    await att.approveRegularization(id, action);
    await load();
  };

  const columns = [
    { key: 'attendance_date', header: 'Date', sortable: true },
    { key: 'emp', header: 'Employee', accessor: (r) => `${r.emp_code} - ${r.first_name} ${r.last_name}` },
    { key: 'requested_check_in', header: 'Req In' },
    { key: 'requested_check_out', header: 'Req Out' },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions', accessor: (r) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => act(r.id, 'approve')} disabled={r.status !== 'pending'}>Approve</Button>
        <Button size="sm" variant="danger" onClick={() => act(r.id, 'reject')} disabled={r.status !== 'pending'}>Reject</Button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Regularization Requests</h1>
        <Button variant="secondary" onClick={load} disabled={loading}>Refresh</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input label="From" type="date" value={filters.from} onChange={(e)=>setFilters(f=>({...f, from:e.target.value}))} />
            <Input label="To" type="date" value={filters.to} onChange={(e)=>setFilters(f=>({...f, to:e.target.value}))} />
            <Select label="Employee" value={filters.employee_id} onChange={(e)=>setFilters(f=>({...f, employee_id:e.target.value}))}
              options={[{ label: 'All', value: '' }, ...employees.map(e=>({ label: `${e.employee_id} - ${e.first_name} ${e.last_name}`, value: e.id }))]}
            />
            <Select label="Status" value={filters.status} onChange={(e)=>setFilters(f=>({...f, status:e.target.value}))}
              options={[{ label:'All', value:'' }, { label:'pending', value:'pending' }, { label:'approved', value:'approved' }, { label:'rejected', value:'rejected' }]}
            />
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
