import React from 'react';
import * as hr from '@/services/hr.service';
import * as att from '@/services/hr.attendance.service.js';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

export default function AttendanceReport() {
  const [employees, setEmployees] = React.useState([]);
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({ from: '', to: '', employee_id: '', status: '' });

  React.useEffect(() => { hr.listEmployees().then(setEmployees); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const data = await att.report(params);
      setRecords(data);
    } finally { setLoading(false); }
  };

  const exportCSV = () => {
    const headers = ['Date','Emp Code','Name','Status','Check-in','Check-out','Hours','Notes'];
    const rows = records.map((r) => [r.attendance_date, r.emp_code, `${r.first_name} ${r.last_name}`, r.status, r.check_in || '', r.check_out || '', r.worked_hours || '', r.notes || '']);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'attendance-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'attendance_date', header: 'Date', sortable: true },
    { key: 'emp_code', header: 'Emp Code', sortable: true },
    { key: 'name', header: 'Name', accessor: (r) => `${r.first_name} ${r.last_name}` },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'check_in', header: 'Check-in' },
    { key: 'check_out', header: 'Check-out' },
    { key: 'worked_hours', header: 'Hours' },
    { key: 'notes', header: 'Notes' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance Report</h1>
        <Button variant="secondary" onClick={exportCSV} disabled={!records.length}>Export</Button>
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
              options={[{ label: 'All', value: '' }, { label: 'present', value:'present' }, { label: 'absent', value:'absent' }, { label: 'late', value:'late' }]}
            />
            <div className="flex items-end"><Button variant="secondary" onClick={load} disabled={loading}>Apply</Button></div>
          </div>
        </CardHeader>
        <CardContent>
          <Table columns={columns} data={records} />
        </CardContent>
      </Card>
    </div>
  );
}
