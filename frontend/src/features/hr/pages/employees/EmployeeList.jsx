import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import * as hr from '@/services/hr.service';
import * as masters from '@/services/hr.masters.service';
import * as lookups from '@/services/hr.lookups.service.js';
import { useNavigate } from 'react-router-dom';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [departments, setDepartments] = React.useState([]);
  const [designations, setDesignations] = React.useState([]);
  const [statusOptions, setStatusOptions] = React.useState([]);
  const [filters, setFilters] = React.useState({ q: '', department_id: '', designation_id: '', status: '' });
  const [selected, setSelected] = React.useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const data = await hr.listEmployees(params);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    masters.listDepartments().then(setDepartments);
    masters.listDesignations().then(setDesignations);
    lookups.list('employment_status').then(setStatusOptions);
  }, []);

  React.useEffect(() => { load(); }, [filters.department_id, filters.designation_id, filters.status]);

  const onSearch = (e) => {
    const q = e.target.value;
    setFilters((f) => ({ ...f, q }));
    const handler = setTimeout(() => load(), 300);
    return () => clearTimeout(handler);
  };

  const toggleSelect = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clearSelection = () => setSelected(new Set());

  const bulkSetStatus = async (status) => {
    if (!selected.size) return;
    setLoading(true);
    try {
      for (const id of selected) {
        await hr.updateEmployee(id, { employment_status: status });
      }
      clearSelection();
      await load();
    } finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    await hr.deleteEmployee(id);
    await load();
  };

  const exportCSV = () => {
    const headers = ['Employee ID','First Name','Last Name','Department','Designation','Status'];
    const rows = items.map((r) => [r.employee_id, r.first_name, r.last_name, r.department || '', r.designation || '', r.employment_status || '']);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'employees.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'select', header: '', accessor: (row) => (
      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} aria-label={`Select ${row.employee_id}`} />
    ), width: '36px' },
    { key: 'employee_id', header: 'Employee ID', sortable: true },
    { key: 'name', header: 'Name', accessor: (r) => `${r.first_name} ${r.last_name}` },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'designation', header: 'Designation', sortable: true },
    { key: 'employment_status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', accessor: (row) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/hr/employees/${row.id}`)}>View</Button>
        <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/hr/employees/${row.id}?edit=1`)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(row.id)}>Delete</Button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Employees</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={exportCSV} variant="secondary">Export</Button>
          <Button size="sm" onClick={() => navigate('/admin/hr/employees/new')}>Add Employee</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Input label="Search" placeholder="Name / Code" defaultValue={filters.q} onChange={onSearch} />
            <Select label="Department" value={filters.department_id} onChange={(e) => setFilters(f=>({ ...f, department_id: e.target.value }))}
              options={[{ label: 'All', value: '' }, ...departments.map(d=>({ label: d.name, value: d.id }))]}
            />
            <Select label="Designation" value={filters.designation_id} onChange={(e) => setFilters(f=>({ ...f, designation_id: e.target.value }))}
              options={[{ label: 'All', value: '' }, ...designations.map(d=>({ label: d.title, value: d.id }))]}
            />
            <Select label="Status" value={filters.status} onChange={(e) => setFilters(f=>({ ...f, status: e.target.value }))}
              options={[{ label: 'All', value: '' }, ...statusOptions.map(o => ({ label: o.name, value: o.code }))]}
            />
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={() => setFilters({ q: '', department_id: '', designation_id: '', status: '' })}>Reset</Button>
              <Button variant="secondary" onClick={load} disabled={loading}>Apply</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-gray-500">{selected.size} selected</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => bulkSetStatus('active')} disabled={!selected.size}>Activate</Button>
              <Button size="sm" variant="secondary" onClick={() => bulkSetStatus('inactive')} disabled={!selected.size}>Deactivate</Button>
              <Button size="sm" variant="ghost" onClick={clearSelection} disabled={!selected.size}>Clear</Button>
            </div>
          </div>
          <Table columns={columns} data={items} showSearch={false} />
        </CardContent>
      </Card>
    </div>
  );
}
