import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import * as HR from '@/services/hr.service';
import * as Masters from '@/services/hr.masters.service';

export default function EmployeesPage() {
  const [data, setData] = React.useState<HR.Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  const [departments, setDepartments] = React.useState<Masters.Department[]>([]);
  const [designations, setDesignations] = React.useState<Masters.Designation[]>([]);

  const [form, setForm] = React.useState({
    branch_id: '',
    employee_id: '',
    first_name: '',
    last_name: '',
    department_id: '',
    designation_id: '',
    employment_type: 'full_time',
    joining_date: ''
  });

  React.useEffect(() => {
    refresh();
    Masters.listDepartments().then(setDepartments).catch(() => {});
    Masters.listDesignations().then(setDesignations).catch(() => {});
  }, []);

  function refresh() {
    setLoading(true);
    HR.listEmployees()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load employees'))
      .finally(() => setLoading(false));
  }

  const columns: Column<HR.Employee>[] = [
    { key: 'employee_id', header: 'Code', sortable: true },
    { key: 'first_name', header: 'First Name', sortable: true },
    { key: 'last_name', header: 'Last Name', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'designation', header: 'Designation', sortable: true },
    { key: 'employment_status', header: 'Status', sortable: true },
  ];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const payload: any = {
        employee_id: form.employee_id,
        first_name: form.first_name,
        last_name: form.last_name,
        joining_date: form.joining_date,
      };
      if (form.branch_id) payload.branch_id = form.branch_id;
      if (form.department_id) payload.department_id = form.department_id;
      if (form.designation_id) payload.designation_id = form.designation_id;
      if (form.employment_type) payload.employment_type = form.employment_type;
      await HR.createEmployee(payload);
      setOpen(false);
      setForm({ branch_id: '', employee_id: '', first_name: '', last_name: '', department_id: '', designation_id: '', employment_type: 'full_time', joining_date: '' });
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => setOpen(true)}>Add Employee</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="font-semibold">All Employees</div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            <Table columns={columns} data={data} initialSortKey="employee_id" />
          )}
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Employee">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Employee Code" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="First Name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
            <Input label="Last Name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
          </div>
          <Input label="Branch ID (admins only)" value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Department"
              value={form.department_id}
              onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
              options={[{ label: '—', value: '' }, ...departments.map(d => ({ label: d.name, value: d.id }))]}
            />
            <Select
              label="Designation"
              value={form.designation_id}
              onChange={e => setForm(f => ({ ...f, designation_id: e.target.value }))}
              options={[{ label: '—', value: '' }, ...designations.map(d => ({ label: d.title, value: d.id }))]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Employment Type"
              value={form.employment_type}
              onChange={e => setForm(f => ({ ...f, employment_type: e.target.value }))}
              options={[
                { label: 'Full-time', value: 'full_time' },
                { label: 'Part-time', value: 'part_time' },
                { label: 'Contract', value: 'contract' },
                { label: 'Temporary', value: 'temporary' },
              ]}
            />
            <Input label="Joining Date" type="date" value={form.joining_date} onChange={e => setForm(f => ({ ...f, joining_date: e.target.value }))} required />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
