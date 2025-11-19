import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import * as payroll from '@/services/hr.payroll.service.js';

export default function TaxDeductionReports() {
  const [periods, setPeriods] = React.useState([]);
  const [periodId, setPeriodId] = React.useState('');
  const [report, setReport] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const formatAmount = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(val || 0));

  React.useEffect(() => {
    const loadPeriods = async () => {
      try {
        const list = await payroll.listPeriods({ status: 'completed' });
        setPeriods(list);
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to load payroll periods');
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadPeriods();
  }, []);

  const loadReport = async (id) => {
    if (!id) {
      setReport(null);
      return;
    }
    setLoading(true);
    try {
      const data = await payroll.taxReport({ period_id: id });
      setReport(data || null);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load tax & deduction report');
    } finally {
      setLoading(false);
    }
  };

  const onChangePeriod = async (e) => {
    const id = e.target.value;
    setPeriodId(id);
    await loadReport(id);
  };

  const selected = periods.find((p) => p.id === periodId) || null;
  const summary = report?.summary || {};
  const components = report?.components || [];

  const totalDeductions = Number(summary.total_deductions || 0);
  const taxable = Number(summary.total_taxable_deductions || 0);
  const nonTaxable = Number(summary.total_nontax_deductions || 0);

  const columns = [
    { key: 'name', header: 'Component' },
    { key: 'type', header: 'Type' },
    { key: 'is_taxable', header: 'Taxable', accessor: (r) => (r.is_taxable ? 'Yes' : 'No') },
    { key: 'employee_count', header: 'Employees' },
    { key: 'total_amount', header: 'Total Amount', accessor: (r) => formatAmount(r.total_amount) }
  ];

  const exportCSV = () => {
    if (!components.length) return;
    const headers = ['Component','Type','Taxable','Employees','Total Amount'];
    const rows = components.map((c) => [
      c.name || '',
      c.type || '',
      c.is_taxable ? 'Yes' : 'No',
      c.employee_count ?? '',
      c.total_amount ?? ''
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-deduction-report-${selected?.period_name || 'period'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tax &amp; Deduction Reports</h1>
          <p className="text-sm text-gray-500">Breakdown of payroll deductions and taxable amounts for a selected period.</p>
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
              <div className="flex flex-col items-end gap-2 text-right text-xs text-gray-500">
                <div>
                  Payment date: {(selected.payment_date || '').slice(0, 10) || '—'}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={exportCSV}
                  disabled={!components.length}
                >
                  Export
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a period to view deduction report.</div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : !selected ? (
            <div className="text-sm text-gray-500">No period selected.</div>
          ) : !report ? (
            <div className="text-sm text-gray-500">No deduction data available for this period.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="border rounded-md p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Total Deductions</div>
                  <div className="mt-1 text-lg font-semibold">{formatAmount(totalDeductions)}</div>
                </div>
                <div className="border rounded-md p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Taxable Deductions</div>
                  <div className="mt-1 text-lg font-semibold">{formatAmount(taxable)}</div>
                </div>
                <div className="border rounded-md p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Non-taxable Deductions</div>
                  <div className="mt-1 text-lg font-semibold">{formatAmount(nonTaxable)}</div>
                </div>
                <div className="border rounded-md p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Deduction Components</div>
                  <div className="mt-1 text-lg font-semibold">{components.length}</div>
                </div>
              </div>

              <Table columns={columns} data={components} showSearch={true} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
