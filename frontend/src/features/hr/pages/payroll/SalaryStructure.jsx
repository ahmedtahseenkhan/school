import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as hr from '@/services/hr.service';
import * as masters from '@/services/hr.masters.service';
import * as structure from '@/services/hr.salary-structure.service.js';

export default function SalaryStructure() {
  const [employees, setEmployees] = React.useState([]);
  const [components, setComponents] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [employeeId, setEmployeeId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ component_id: '', amount: '', effective_date: '', end_date: '' });

  React.useEffect(() => {
    hr.listEmployees().then(setEmployees);
    masters.listSalaryComponents().then(setComponents);
  }, []);

  const loadStructures = async (empId) => {
    if (!empId) { setItems([]); return; }
    setLoading(true);
    try {
      const list = await structure.list({ employee_id: empId });
      setItems(list);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load salary structure');
    } finally {
      setLoading(false);
    }
  };

  const onChangeEmployee = async (e) => {
    const id = e.target.value;
    setEmployeeId(id);
    await loadStructures(id);
  };

  const openCreate = () => {
    if (!employeeId) return alert('Select an employee first');
    setEditing(null);
    setForm({ component_id: '', amount: '', effective_date: '', end_date: '' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      component_id: row.component_id,
      amount: row.amount,
      effective_date: row.effective_date?.slice(0, 10) || '',
      end_date: row.end_date?.slice(0, 10) || '',
    });
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!employeeId) return alert('Select employee');
    if (!form.component_id || !form.amount || !form.effective_date) {
      return alert('Component, amount and effective date are required');
    }
    setSaving(true);
    try {
      const payload = {
        employee_id: employeeId,
        component_id: form.component_id,
        amount: Number(form.amount),
        effective_date: form.effective_date,
        end_date: form.end_date || null,
      };
      if (editing?.id) await structure.update(editing.id, payload);
      else await structure.create(payload);
      setModalOpen(false);
      setEditing(null);
      await loadStructures(employeeId);
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm('Remove this salary component from employee?')) return;
    try {
      await structure.remove(row.id);
      await loadStructures(employeeId);
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const componentOptions = components.map((c) => ({
    label: `${c.name} (${c.type}/${c.calculation_type})`,
    value: c.id,
  }));

  const employeeOptions = employees.map((e) => ({
    label: `${e.employee_id} - ${e.first_name} ${e.last_name}`,
    value: e.id,
  }));

  const columns = [
    { key: 'name', header: 'Component', accessor: (r) => r.name || r.component_name || 'Component' },
    { key: 'type', header: 'Type' },
    { key: 'calculation_type', header: 'Calc Type' },
    { key: 'amount', header: 'Amount' },
    { key: 'effective_date', header: 'Effective From', accessor: (r) => (r.effective_date || '').slice(0, 10) },
    { key: 'end_date', header: 'End Date', accessor: (r) => (r.end_date || '').slice(0, 10) || '-' },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Salary Structure</h1>
          <p className="text-sm text-gray-500">Assign salary components to employees.</p>
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
          <Button onClick={openCreate} disabled={!employeeId}>Add Component</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Current salary structure for the selected employee.</div>
        </CardHeader>
        <CardContent>
          {!employeeId ? (
            <div className="text-sm text-gray-500">Select an employee to view salary structure.</div>
          ) : loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : items.length ? (
            <Table columns={columns} data={items} showSearch={false} />
          ) : (
            <div className="text-sm text-gray-500">No salary components assigned yet.</div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => { if (!saving) { setModalOpen(false); setEditing(null); } }}
        title={editing ? 'Edit Salary Component' : 'Add Salary Component'}
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
              label="Effective Date"
              type="date"
              value={form.effective_date}
              onChange={(e) => setForm((f) => ({ ...f, effective_date: e.target.value }))}
              required
            />
            <Input
              label="End Date (optional)"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            />
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
