import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as masters from '@/services/hr.masters.service';

export default function AttendanceDevicesPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({
    device_name: '',
    device_id: '',
    device_type: '',
    location: '',
    ip_address: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await masters.listAttendanceDevices();
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
    const s = (`${i.device_name || ''} ${i.device_id || ''} ${i.device_type || ''} ${i.location || ''} ${i.ip_address || ''}`).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const startCreate = () => {
    setEditing(null);
    setForm({ device_name: '', device_id: '', device_type: '', location: '', ip_address: '' });
    setOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({
      device_name: row.device_name || '',
      device_id: row.device_id || '',
      device_type: row.device_type || '',
      location: row.location || '',
      ip_address: row.ip_address || '',
    });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.device_name || !form.device_id) return alert('Device Name and Device ID are required');
    try {
      const payload = { ...form };
      if (editing) await masters.updateAttendanceDevice(editing.id, payload);
      else await masters.createAttendanceDevice(payload);
      setOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (row) => {
    if (!confirm('Delete this device?')) return;
    await masters.deleteAttendanceDevice(row.id);
    await load();
  };

  const columns = [
    { key: 'device_id', header: 'Code', sortable: true },
    { key: 'device_type', header: 'Device Type' },
    { key: 'device_name', header: 'Device Name', sortable: true },
    { key: 'location', header: 'Site' },
    { key: 'ip_address', header: 'Device IP' },
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
        <h1 className="text-2xl font-bold">Device Registration</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={startCreate}>Add</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Register and manage attendance devices (e.g., biometric machines).</div>
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
        title={editing ? 'Edit Device' : 'Add Device'}
      >
        <form className="space-y-3" onSubmit={onSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Code / Device ID"
              value={form.device_id}
              onChange={(e) => setForm((f) => ({ ...f, device_id: e.target.value }))}
              required
            />
            <Input
              label="Device Name"
              value={form.device_name}
              onChange={(e) => setForm((f) => ({ ...f, device_name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Device Type"
              placeholder="e.g. ZK Attendance"
              value={form.device_type}
              onChange={(e) => setForm((f) => ({ ...f, device_type: e.target.value }))}
            />
            <Input
              label="Site"
              placeholder="e.g. Main Campus"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              label="Device IP"
              value={form.ip_address}
              onChange={(e) => setForm((f) => ({ ...f, ip_address: e.target.value }))}
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
