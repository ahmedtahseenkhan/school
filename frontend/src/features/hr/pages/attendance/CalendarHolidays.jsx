import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as masters from '@/services/hr.masters.service';

export default function CalendarHolidaysPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    code: '',
    name: '',
    payroll_register: '',
    payroll_period: '',
    apply_on: '',
    year: '',
    period_label: '',
    start_date: '',
    end_date: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await masters.listCalendarHolidays();
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
    const s = (`${i.code || ''} ${i.name || ''} ${i.payroll_register || ''} ${i.payroll_period || ''} ${i.apply_on || ''}`).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const startCreate = () => {
    setEditing(null);
    setForm({ code: '', name: '', payroll_register: '', payroll_period: '', apply_on: '', year: '', period_label: '', start_date: '', end_date: '' });
    setOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({
      code: row.code || '',
      name: row.name || '',
      payroll_register: row.payroll_register || '',
      payroll_period: row.payroll_period || '',
      apply_on: row.apply_on || '',
      year: row.year || '',
      period_label: row.period_label || '',
      start_date: row.start_date || '',
      end_date: row.end_date || '',
    });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name) return alert('Code and Calendar Holiday are required');
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : null,
      };
      if (editing) await masters.updateCalendarHoliday(editing.id, payload);
      else await masters.createCalendarHoliday(payload);
      setOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (row) => {
    if (!confirm('Delete this calendar holiday?')) return;
    await masters.deleteCalendarHoliday(row.id);
    await load();
  };

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Calendar Holiday', sortable: true },
    { key: 'payroll_register', header: 'Payroll Register' },
    { key: 'payroll_period', header: 'Payroll Period' },
    { key: 'apply_on', header: 'Apply On' },
    { key: 'year', header: 'Year' },
    { key: 'period_label', header: 'Period' },
    { key: 'start_date', header: 'Start Date' },
    { key: 'end_date', header: 'End Date' },
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
        <h1 className="text-2xl font-bold">Calendar Holidays</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Configure calendar holiday periods used for attendance and payroll.</div>
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
        title={editing ? 'Edit Calendar Holiday' : 'Add Calendar Holiday'}
      >
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            <Input
              label="Calendar Holiday"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Payroll Register"
              value={form.payroll_register}
              onChange={(e) => setForm((f) => ({ ...f, payroll_register: e.target.value }))}
            />
            <Input
              label="Payroll Period"
              value={form.payroll_period}
              onChange={(e) => setForm((f) => ({ ...f, payroll_period: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Apply On" value={form.apply_on} onChange={(e) => setForm((f) => ({ ...f, apply_on: e.target.value }))} />
            <Input
              label="Year"
              type="number"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
            />
            <Input
              label="Period Label"
              placeholder="e.g. 2025-2026 (BMS)"
              value={form.period_label}
              onChange={(e) => setForm((f) => ({ ...f, period_label: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            />
          </div>
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
