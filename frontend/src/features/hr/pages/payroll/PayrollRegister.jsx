import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import * as payroll from '@/services/hr.payroll.service.js';

function useQueryPeriodId() {
  const [params] = useSearchParams();
  return params.get('period_id') || '';
}

export default function PayrollRegister() {
  const [periods, setPeriods] = React.useState([]);
  const [periodId, setPeriodId] = React.useState('');
  const [period, setPeriod] = React.useState(null);
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const initialFromQuery = useQueryPeriodId();
  const location = useLocation();

  React.useEffect(() => {
    const load = async () => {
      const list = await payroll.listPeriods();
      setPeriods(list);
      if (initialFromQuery && list.find((p) => p.id === initialFromQuery)) {
        setPeriodId(initialFromQuery);
        await loadRegister(initialFromQuery, list);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const loadRegister = async (id, knownPeriods = periods) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await payroll.register(id);
      setPeriod(data.period || null);
      setRecords(data.records || []);
      if (!knownPeriods.length) {
        const list = await payroll.listPeriods();
        setPeriods(list);
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load payroll register');
    } finally {
      setLoading(false);
    }
  };

  const onChangePeriod = async (e) => {
    const id = e.target.value;
    setPeriodId(id);
    await loadRegister(id);
  };

  const columns = [
    { key: 'employee_id', header: 'Employee ID' },
    { key: 'employee_name', header: 'Employee', accessor: (r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() },
    { key: 'gross_earnings', header: 'Gross' },
    { key: 'total_deductions', header: 'Deductions' },
    { key: 'net_salary', header: 'Net' },
    { key: 'status', header: 'Status' },
  ];

  const exportCSV = () => {
    if (!records.length) return;
    const headers = ['Employee ID','Employee Name','Gross','Deductions','Net','Status'];
    const rows = records.map((r) => [
      r.employee_id || '',
      `${r.first_name || ''} ${r.last_name || ''}`.trim(),
      r.gross_earnings ?? '',
      r.total_deductions ?? '',
      r.net_salary ?? '',
      r.status || ''
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-register-${period?.period_name || 'period'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Register</h1>
          <p className="text-sm text-gray-500">Employee-wise payroll details for a selected period.</p>
        </div>
        <div className="w-64 space-y-1 text-sm">
          <label className="block text-xs font-medium text-gray-700">Payroll Period</label>
          <select
            className="w-full rounded-md border bg-white border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            value={periodId}
            onChange={onChangePeriod}
          >
            <option value="">Select period</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.period_name} ({(p.start_date || '').slice(0, 10)} - {(p.end_date || '').slice(0, 10)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          {period ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm">
              <div>
                <div className="font-semibold">{period.period_name}</div>
                <div className="text-gray-500">
                  {(period.start_date || '').slice(0, 10)} – {(period.end_date || '').slice(0, 10)} • Status: {period.status}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-right text-xs text-gray-500">
                <div>
                  Payment date: {(period.payment_date || '').slice(0, 10) || '—'}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={exportCSV}
                  disabled={!records.length}
                >
                  Export
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a payroll period to view register.</div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : !period ? (
            <div className="text-sm text-gray-500">No period selected.</div>
          ) : records.length ? (
            <Table columns={columns} data={records} showSearch={true} />
          ) : (
            <div className="text-sm text-gray-500">No payroll records found for this period.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
