import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import * as hr from '@/services/hr.service';
import * as audit from '@/services/hr.audit.service.js';

export default function PayrollAuditLog() {
  const [employees, setEmployees] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [employeeId, setEmployeeId] = React.useState('');
  const [entityType, setEntityType] = React.useState('');
  const [action, setAction] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        const emp = await hr.listEmployees();
        setEmployees(emp);
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to load employees');
      }
      await loadLogs();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildParams = () => {
    const params = {};
    if (employeeId) params.employee_id = employeeId;
    if (entityType) params.entity_type = entityType;
    if (action) params.action = action;
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    return params;
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const list = await audit.list(buildParams());
      setLogs(list);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load audit log');
    } finally {
      setLoading(false);
    }
  };

  const onApplyFilters = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await loadLogs();
  };

  const employeeOptions = employees.map((e) => ({
    label: `${e.employee_id} - ${e.first_name} ${e.last_name}`,
    value: e.id
  }));

  const columns = [
    { key: 'performed_at', header: 'When', accessor: (r) => (r.performed_at || '').replace('T', ' ').slice(0, 19) },
    { key: 'entity_type', header: 'Entity' },
    { key: 'action', header: 'Action' },
    {
      key: 'employee',
      header: 'Employee',
      accessor: (r) =>
        r.employee_code
          ? `${r.employee_code} - ${(r.first_name || '')} ${(r.last_name || '')}`.trim()
          : ''
    },
    { key: 'performed_by_email', header: 'By' },
    {
      key: 'changes',
      header: 'Changes',
      accessor: (r) => {
        const parts = [];
        if (r.old_values) parts.push('old');
        if (r.new_values) parts.push('new');
        return parts.length ? parts.join(' / ') : '';
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Audit Log</h1>
          <p className="text-sm text-gray-500">View changes to salary structure and recurring deductions for compliance.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm" onSubmit={onApplyFilters}>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">All</option>
                {employeeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Entity</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
              >
                <option value="">All</option>
                <option value="salary_structure">Salary Structure</option>
                <option value="recurring_deduction">Recurring Deduction</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="">All</option>
                <option value="create">create</option>
                <option value="update">update</option>
                <option value="delete">delete</option>
              </select>
            </div>
            <div>
              <Input
                label="From"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="To"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </form>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              className="px-3 py-1.5 rounded-md text-sm border border-gray-300 bg-white hover:bg-gray-50"
              onClick={onApplyFilters}
            >
              Apply Filters
            </button>
          </div>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : logs.length ? (
            <Table columns={columns} data={logs} showSearch={false} />
          ) : (
            <div className="text-sm text-gray-500">No audit entries found for selected filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
