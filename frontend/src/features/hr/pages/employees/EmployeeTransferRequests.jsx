import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import * as hr from '@/services/hr.service';
import * as masters from '@/services/hr.masters.service';
import * as transfers from '@/services/hr.transfers.service.js';

export default function EmployeeTransferRequests() {
  const [employees, setEmployees] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);
  const [designations, setDesignations] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [filterEmployeeId, setFilterEmployeeId] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('pending');

  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    employee_id: '',
    to_department_id: '',
    to_designation_id: '',
    effective_date: '',
    reason: ''
  });

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        const [emp, deps, desigs] = await Promise.all([
          hr.listEmployees(),
          masters.listDepartments(),
          masters.listDesignations()
        ]);
        setEmployees(emp);
        setDepartments(deps);
        setDesignations(desigs);
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to load employees/departments/designations');
      }
      await loadTransfers({ status: 'pending' });
    })();
  }, []);

  const buildParams = (extra = {}) => {
    const p = { ...extra };
    if (filterEmployeeId) p.employee_id = filterEmployeeId;
    if (filterStatus) p.status = filterStatus;
    return p;
  };

  const loadTransfers = async (extraParams = {}) => {
    setLoading(true);
    try {
      const list = await transfers.list(buildParams(extraParams));
      setItems(list);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load transfer requests');
    } finally {
      setLoading(false);
    }
  };

  const onApplyFilters = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    await loadTransfers();
  };

  const onOpenNew = () => {
    setForm({ employee_id: '', to_department_id: '', to_designation_id: '', effective_date: '', reason: '' });
    setCreating(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.to_department_id || !form.effective_date) {
      return alert('Employee, To Department and Effective Date are required');
    }
    setLoading(true);
    try {
      await transfers.create({
        employee_id: form.employee_id,
        to_department_id: form.to_department_id,
        to_designation_id: form.to_designation_id || null,
        effective_date: form.effective_date,
        reason: form.reason || null
      });
      setCreating(false);
      await loadTransfers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create transfer request');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (row, status) => {
    const comment = window.prompt('Approval comment (optional)', '') || undefined;
    setLoading(true);
    try {
      await transfers.update(row.id, { status, approval_comment: comment });
      await loadTransfers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update transfer');
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = employees.map((e) => ({
    label: `${e.employee_id} - ${e.first_name} ${e.last_name}`,
    value: e.id
  }));

  const departmentOptions = departments.map((d) => ({ label: d.name, value: d.id }));
  const designationOptions = designations.map((d) => ({ label: d.title, value: d.id }));

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      accessor: (r) => `${r.employee_id || ''} - ${(r.first_name || '')} ${(r.last_name || '')}`.trim()
    },
    {
      key: 'from_to_department',
      header: 'Department',
      accessor: (r) => `${r.from_department_name || '—'} → ${r.to_department_name || '—'}`
    },
    {
      key: 'from_to_designation',
      header: 'Designation',
      accessor: (r) => `${r.from_designation_name || '—'} → ${r.to_designation_name || '—'}`
    },
    { key: 'effective_date', header: 'Effective Date', accessor: (r) => (r.effective_date || '').slice(0, 10) },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-xs">
          {row.status === 'pending' && (
            <>
              <Button size="sm" variant="secondary" onClick={() => updateStatus(row, 'approved')}>Approve</Button>
              <Button size="sm" variant="danger" onClick={() => updateStatus(row, 'rejected')}>Reject</Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employee Transfer Requests</h1>
          <p className="text-sm text-gray-500">Record and approve transfers between departments or roles.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Button onClick={onOpenNew}>New Transfer</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm" onSubmit={onApplyFilters}>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
              >
                <option value="">All</option>
                {employeeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div>
              <Input
                label="From Date (created)"
                type="date"
                disabled
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md text-sm border border-gray-300 bg-white hover:bg-gray-50"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : items.length ? (
            <Table columns={columns} data={items} showSearch={true} />
          ) : (
            <div className="text-sm text-gray-500">No transfer requests found.</div>
          )}
        </CardContent>
      </Card>

      {creating && (
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">New Transfer Request</div>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={form.employee_id}
                    onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                    required
                  >
                    <option value="">Select employee</option>
                    {employeeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To Department</label>
                  <select
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={form.to_department_id}
                    onChange={(e) => setForm((f) => ({ ...f, to_department_id: e.target.value }))}
                    required
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To Designation (optional)</label>
                  <select
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={form.to_designation_id}
                    onChange={(e) => setForm((f) => ({ ...f, to_designation_id: e.target.value }))}
                  >
                    <option value="">Select designation</option>
                    {designationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Effective Date"
                  type="date"
                  value={form.effective_date}
                  onChange={(e) => setForm((f) => ({ ...f, effective_date: e.target.value }))}
                  required
                />
              </div>
              <Input
                label="Reason"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
