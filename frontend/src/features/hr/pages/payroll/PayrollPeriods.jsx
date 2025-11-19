import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { useNavigate } from 'react-router-dom';
import * as payroll from '@/services/hr.payroll.service.js';

export default function PayrollPeriods() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [savingId, setSavingId] = React.useState(null);

  const navigate = useNavigate();

  const load = async (filters = {}) => {
    setLoading(true);
    try {
      const list = await payroll.listPeriods(filters);
      setItems(list);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load payroll periods');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const onFilter = (e) => {
    const v = e.target.value;
    setStatus(v);
    load(v ? { status: v } : {});
  };

  const updateStatus = async (row, nextStatus) => {
    if (row.status === nextStatus) return;
    if (!window.confirm(`Change status to ${nextStatus}?`)) return;
    setSavingId(row.id);
    try {
      await payroll.updatePeriod(row.id, { status: nextStatus });
      await load(status ? { status } : {});
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update period');
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { key: 'period_name', header: 'Period' },
    { key: 'start_date', header: 'Start', accessor: (r) => (r.start_date || '').slice(0, 10) },
    { key: 'end_date', header: 'End', accessor: (r) => (r.end_date || '').slice(0, 10) },
    { key: 'payment_date', header: 'Payment', accessor: (r) => (r.payment_date || '').slice(0, 10) || '-' },
    { key: 'status', header: 'Status', accessor: (r) => r.status || 'draft' },
    { key: 'employee_count', header: 'Employees', accessor: (r) => r.employee_count || 0 },
    { key: 'total_net', header: 'Net Total', accessor: (r) => r.total_net || 0 },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-xs">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/hr/payroll/register?period_id=${row.id}`)}>
            View Register
          </Button>
          <select
            className="border rounded px-2 py-1"
            value={row.status || 'draft'}
            disabled={savingId === row.id}
            onChange={(e) => updateStatus(row, e.target.value)}
          >
            <option value="draft">draft</option>
            <option value="processing">processing</option>
            <option value="completed">completed</option>
            <option value="locked">locked</option>
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Periods</h1>
          <p className="text-sm text-gray-500">Overview of all processed payroll periods.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-40 space-y-1 text-sm">
            <label className="block text-xs font-medium text-gray-700">Filter by status</label>
            <select
              className="w-full rounded-md border bg-white border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              value={status}
              onChange={onFilter}
            >
              <option value="">All statuses</option>
              <option value="draft">draft</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="locked">locked</option>
            </select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Recently processed payroll periods.</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : items.length ? (
            <Table columns={columns} data={items} showSearch={false} />
          ) : (
            <div className="text-sm text-gray-500">No payroll periods found. Run payroll processing to create one.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
