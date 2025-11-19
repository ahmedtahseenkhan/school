import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import * as payroll from '@/services/hr.payroll.service.js';

export default function PayrollSummary() {
  const [periods, setPeriods] = React.useState([]);
  const [periodId, setPeriodId] = React.useState('');
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const formatAmount = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(val || 0));

  React.useEffect(() => {
    const loadPeriods = async () => {
      try {
        const list = await payroll.listPeriods();
        setPeriods(list);
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to load periods');
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadPeriods();
  }, []);

  const loadSummary = async (id) => {
    if (!id) {
      setSummary(null);
      return;
    }
    setLoading(true);
    try {
      const data = await payroll.report({ period_id: id });
      setSummary(data || null);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load payroll summary');
    } finally {
      setLoading(false);
    }
  };

  const onChangePeriod = async (e) => {
    const id = e.target.value;
    setPeriodId(id);
    await loadSummary(id);
  };

  const selected = periods.find((p) => p.id === periodId) || null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Summary</h1>
          <p className="text-sm text-gray-500">Overview of total gross, deductions and net for a payroll period.</p>
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
          {selected ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm">
              <div>
                <div className="font-semibold">{selected.period_name}</div>
                <div className="text-gray-500">
                  {(selected.start_date || '').slice(0, 10)} – {(selected.end_date || '').slice(0, 10)} • Status: {selected.status}
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                Payment date: {(selected.payment_date || '').slice(0, 10) || '—'}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a period to view summary.</div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : !selected ? (
            <div className="text-sm text-gray-500">No period selected.</div>
          ) : !summary ? (
            <div className="text-sm text-gray-500">No summary data available for this period.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="text-xs text-gray-500">Employees</div>
                <div className="mt-1 text-lg font-semibold">{summary.employee_count || 0}</div>
              </div>
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="text-xs text-gray-500">Total Gross</div>
                <div className="mt-1 text-lg font-semibold">{formatAmount(summary.total_gross)}</div>
              </div>
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="text-xs text-gray-500">Total Deductions</div>
                <div className="mt-1 text-lg font-semibold">{formatAmount(summary.total_deductions)}</div>
              </div>
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="text-xs text-gray-500">Total Net</div>
                <div className="mt-1 text-lg font-semibold">{formatAmount(summary.total_net)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
