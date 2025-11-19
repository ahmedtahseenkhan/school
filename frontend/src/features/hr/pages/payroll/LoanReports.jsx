import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import * as finance from '@/services/hr.finance.service.js';

export default function LoanReports() {
  const [loans, setLoans] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [q, setQ] = React.useState('');

  const formatAmount = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(val || 0));

  const load = async (filters = {}) => {
    setLoading(true);
    try {
      const list = await finance.listLoans(filters);
      setLoans(list);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, []);

  const onStatusChange = (e) => {
    const v = e.target.value;
    setStatus(v);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load(v ? { status: v } : {});
  };

  const filtered = loans.filter((l) => {
    if (!q) return true;
    const s = `${l.employee_code || l.employee_id || ''} ${l.first_name || ''} ${l.last_name || ''} ${l.loan_type || ''} ${l.status || ''}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const totalLoans = loans.length;
  const activeLoans = loans.filter((l) => l.status === 'active').length;
  const closedLoans = loans.filter((l) => l.status === 'closed').length;
  const totalDisbursed = loans.reduce((sum, l) => sum + Number(l.loan_amount || 0), 0);
  const totalRemaining = loans.reduce((sum, l) => sum + Number(l.remaining_amount != null ? l.remaining_amount : l.loan_amount || 0), 0);

  const columns = [
    { key: 'employee', header: 'Employee', accessor: (r) => `${r.employee_code || r.employee_id || ''} - ${(r.first_name || '')} ${(r.last_name || '')}`.trim() },
    { key: 'loan_type', header: 'Loan Type' },
    { key: 'loan_amount', header: 'Amount' },
    { key: 'interest_rate', header: 'Interest %' },
    { key: 'tenure_months', header: 'Tenure (months)' },
    { key: 'start_date', header: 'Start Date', accessor: (r) => (r.start_date || '').slice(0, 10) },
    { key: 'remaining_amount', header: 'Remaining', accessor: (r) => r.remaining_amount != null ? r.remaining_amount : r.loan_amount },
    { key: 'status', header: 'Status' },
  ];

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ['Employee Code','Employee Name','Loan Type','Amount','Interest %','Tenure (months)','Start Date','Remaining','Status'];
    const rows = filtered.map((l) => [
      l.employee_code || l.employee_id || '',
      `${l.first_name || ''} ${l.last_name || ''}`.trim(),
      l.loan_type || '',
      l.loan_amount ?? '',
      l.interest_rate ?? '',
      l.tenure_months ?? '',
      (l.start_date || '').slice(0, 10),
      l.remaining_amount != null ? l.remaining_amount : l.loan_amount ?? '',
      l.status || ''
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan-reports.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loan & Advance Reports</h1>
          <p className="text-sm text-gray-500">Overview of employee loans across the organization.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="w-40 space-y-1 text-sm">
            <label className="block text-xs font-medium text-gray-700">Status</label>
            <select
              className="w-full rounded-md border bg-white border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              value={status}
              onChange={onStatusChange}
            >
              <option value="">All</option>
              <option value="active">active</option>
              <option value="closed">closed</option>
              <option value="defaulted">defaulted</option>
            </select>
          </div>
          <div className="w-56">
            <Input
              placeholder="Search by employee or loan type"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <Button
              size="sm"
              variant="secondary"
              onClick={exportCSV}
              disabled={!filtered.length}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <Card>
          <CardHeader>
            <div className="text-xs text-gray-500">Total Loans</div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{totalLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="text-xs text-gray-500">Active Loans</div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{activeLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="text-xs text-gray-500">Total Disbursed</div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{formatAmount(totalDisbursed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="text-xs text-gray-500">Estimated Outstanding</div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{formatAmount(totalRemaining)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Loan details by employee.</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : filtered.length ? (
            <Table columns={columns} data={filtered} showSearch={false} />
          ) : (
            <div className="text-sm text-gray-500">No loans found for the selected filters.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
