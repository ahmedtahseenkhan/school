import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as hr from '@/services/hr.service';
import * as masters from '@/services/hr.masters.service';
import * as recurringApi from '@/services/hr.recurring-deductions.service.js';

export default function RecurringDeductions() {
  const [employees, setEmployees] = React.useState([]);
  const [components, setComponents] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [employeeId, setEmployeeId] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    component_id: '',
    amount: '',
    start_date: '',
    end_date: '',
    frequency: 'monthly',
    status: 'active'
  });

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        const [emp, comps] = await Promise.all([
          hr.listEmployees(),
          masters.listSalaryComponents()
        ]);
        setEmployees(emp);
        setComponents(comps.filter((c) => c.type === 'deduction'));
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to load employees/components');
      }
    })();
  }, []);

  const loadItems = async (empId) => {
    if (!empId) { setItems([]); return; }
    setLoading(true);
    try {
      const list = await recurringApi.list({ employee_id: empId });
      setItems(list);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load recurring deductions');
    } finally {
      setLoading(false);
    }
  };

  const onChangeEmployee = async (e) => {
    const id = e.target.value;
    setEmployeeId(id);
    await loadItems(id);
  };

  const openCreate = () => {
    if (!employeeId) return alert('Select an employee first');
    setEditing(null);
    setForm({ component_id: '', amount: '', start_date: '', end_date: '', frequency: 'monthly', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      component_id: row.component_id,
      amount: row.amount,
      start_date: (row.start_date || '').slice(0, 10),
      end_date: row.end_date ? row.end_date.slice(0, 10) : '',
      frequency: row.frequency || 'monthly',
      status: row.status || 'active'
    });
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!employeeId) return alert('Select employee');
    if (!form.component_id || !form.amount || !form.start_date) {
      return alert('Component, amount and start date are required');
    }
    setSaving(true);
    try {
      const payload = {
        employee_id: employeeId,
        component_id: form.component_id,
        amount: Number(form.amount),
        start_date: form.start_date,
        end_date: form.end_date || null,
        frequency: form.frequency,
        status: form.status
      };
      if (editing?.id) await recurringApi.update(editing.id, payload);
      else await recurringApi.create(payload);
      setModalOpen(false);
      setEditing(null);
      await loadItems(employeeId);
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm('Delete this recurring deduction?')) return;
    try {
      await recurringApi.remove(row.id);
      await loadItems(employeeId);
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const employeeOptions = employees.map((e) => ({
    label: `${e.employee_id} - ${e.first_name} ${e.last_name}`,
    value: e.id
  }));

  const componentOptions = components.map((c) => ({
    label: `${c.name} (${c.calculation_type})`,
    value: c.id
  }));

  const selectedEmployee = employees.find((e) => e.id === employeeId) || null;

  const columns = [
    { key: 'component_name', header: 'Component' },
    { key: 'amount', header: 'Amount' },
    { key: 'frequency', header: 'Frequency' },
    { key: 'start_date', header: 'Start Date', accessor: (r) => (r.start_date || '').slice(0, 10) },
    { key: 'end_date', header: 'End Date', accessor: (r) => (r.end_date || '').slice(0, 10) || '-' },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Delete</Button>
        </div>
      )
    }
  ];

  const exportCSV = () => {
    if (!items.length || !selectedEmployee) return;
    const headers = ['Employee','Component','Amount','Frequency','Start Date','End Date','Status'];
    const empLabel = `${selectedEmployee.employee_id} - ${selectedEmployee.first_name} ${selectedEmployee.last_name}`;
    const rows = items.map((r) => [
      empLabel,
      r.component_name || '',
      r.amount ?? '',
      r.frequency || '',
      (r.start_date || '').slice(0, 10),
      (r.end_date || '').slice(0, 10),
      r.status || ''
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recurring-deductions-${selectedEmployee.employee_id || 'employee'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recurring Deductions</h1>
          <p className="text-sm text-gray-500">Configure automated monthly deductions for employees.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <select
            className="border rounded px-3 py-2 text-sm min-w-[220px]"
            value={employeeId}
            onChange={onChangeEmployee}
          >
            <option value="">Select employee</option>
            {employeeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Button onClick={openCreate} disabled={!employeeId}>Add Recurring Deduction</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>Recurring deductions for the selected employee.</div>
            {employeeId && (
              <Button
                size="sm"
                variant="secondary"
                onClick={exportCSV}
                disabled={!items.length}
              >
                Export
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!employeeId ? (
            <div className="text-sm text-gray-500">Select an employee to view recurring deductions.</div>
          ) : loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : items.length ? (
            <Table columns={columns} data={items} showSearch={true} />
          ) : (
            <div className="text-sm text-gray-500">No recurring deductions configured yet.</div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => { if (!saving) { setModalOpen(false); setEditing(null); } }}
        title={editing ? 'Edit Recurring Deduction' : 'Add Recurring Deduction'}
      >
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={form.component_id}
                onChange={(e) => setForm((f) => ({ ...f, component_id: e.target.value }))}
                required
              >
                <option value="">Select component</option>
                {componentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              required
            />
            <Input
              label="End Date (optional)"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="ended">ended</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { if (!saving) { setModalOpen(false); setEditing(null); } }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
