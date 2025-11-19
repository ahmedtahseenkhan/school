import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import * as masters from '@/services/hr.masters.service';

const POLICY_TYPES = [
  { label: 'Late Arrival Policy', value: 'late_arrival' },
  { label: 'Absent Policy', value: 'absent' },
  { label: 'Early Departure Policy', value: 'early_departure' },
];

const CALCULATE_ON_OPTIONS = [
  { label: 'Working Days', value: 'working_days' },
  { label: 'Calendar Days', value: 'calendar_days' },
];

export default function AttendancePoliciesPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    code: '',
    name: '',
    policy_type: POLICY_TYPES[0]?.value || '',
    calculate_on: '',
    apply_on_off_days: false,
    description: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await masters.listAttendancePolicies();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    if (!q) return true;
    const s = (`${i.code || ''} ${i.name || ''} ${i.policy_type || ''}`).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const startCreate = () => {
    setEditing(null);
    setForm({ code: '', name: '', policy_type: POLICY_TYPES[0]?.value || '', calculate_on: '', apply_on_off_days: false, description: '' });
    setOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({
      code: row.code || '',
      name: row.name || '',
      policy_type: row.policy_type || '',
      calculate_on: row.calculate_on || '',
      apply_on_off_days: !!row.apply_on_off_days,
      description: row.description || '',
    });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.policy_type) return alert('Code, Policy Name and Policy Type are required');
    try {
      const payload = { ...form };
      if (editing) await masters.updateAttendancePolicy(editing.id, payload);
      else await masters.createAttendancePolicy(payload);
      setOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (row) => {
    if (!confirm('Delete this attendance policy?')) return;
    await masters.deleteAttendancePolicy(row.id);
    await load();
  };

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Policy Name', sortable: true },
    {
      key: 'policy_type',
      header: 'Policy Type',
      accessor: (row) => {
        const m = POLICY_TYPES.find((p) => p.value === row.policy_type);
        return m ? m.label : row.policy_type;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance Policies</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Configure policies for late arrivals, absences, and early departures.</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center">
              <Spinner className="w-6 h-6 text-blue-600" />
            </div>
          ) : (
            <Table columns={columns} data={filtered} showSearch={false} />
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Attendance Policy' : 'Add Attendance Policy'}
      >
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            <Select
              label="Policy Type"
              value={form.policy_type}
              onChange={(e) => setForm((f) => ({ ...f, policy_type: e.target.value }))}
              options={POLICY_TYPES}
            />
          </div>
          <Input
            label="Policy Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Select
            label="Calculate On"
            value={form.calculate_on}
            onChange={(e) => setForm((f) => ({ ...f, calculate_on: e.target.value }))}
            options={CALCULATE_ON_OPTIONS}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.apply_on_off_days}
              onChange={(e) => setForm((f) => ({ ...f, apply_on_off_days: e.target.checked }))}
            />
            <span>Apply on off days</span>
          </label>
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
