import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import * as hr from '@/services/hr.service';
import * as finance from '@/services/hr.finance.service.js';

export default function LoanManagement() {
  const [employees, setEmployees] = React.useState([]);
  const [employeeId, setEmployeeId] = React.useState('');
  const [loans, setLoans] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [loanModalOpen, setLoanModalOpen] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState(null);
  const [loanForm, setLoanForm] = React.useState({
    loan_type: '',
    loan_amount: '',
    interest_rate: '',
    tenure_months: '',
    start_date: '',
    status: 'active',
  });
  const [savingLoan, setSavingLoan] = React.useState(false);

  const [repayModalOpen, setRepayModalOpen] = React.useState(false);
  const [repayments, setRepayments] = React.useState([]);
  const [repayLoanId, setRepayLoanId] = React.useState('');
  const [repayForm, setRepayForm] = React.useState({ payment_date: '', amount: '' });
  const [savingRepay, setSavingRepay] = React.useState(false);

  React.useEffect(() => {
    hr.listEmployees().then(setEmployees);
  }, []);

  const loadLoans = async (empId) => {
    if (!empId) { setLoans([]); return; }
    setLoading(true);
    try {
      const list = await finance.listLoans({ employee_id: empId });
      setLoans(list);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const onChangeEmployee = async (e) => {
    const id = e.target.value;
    setEmployeeId(id);
    await loadLoans(id);
  };

  const openNewLoan = () => {
    if (!employeeId) return alert('Select an employee first');
    setEditingLoan(null);
    setLoanForm({ loan_type: '', loan_amount: '', interest_rate: '', tenure_months: '', start_date: '', status: 'active' });
    setLoanModalOpen(true);
  };

  const openEditLoan = (row) => {
    setEditingLoan(row);
    setLoanForm({
      loan_type: row.loan_type || '',
      loan_amount: row.loan_amount || '',
      interest_rate: row.interest_rate || '',
      tenure_months: row.tenure_months || '',
      start_date: row.start_date?.slice(0, 10) || '',
      status: row.status || 'active',
    });
    setLoanModalOpen(true);
  };

  const saveLoan = async (e) => {
    e.preventDefault();
    if (!employeeId) return alert('Select employee');
    if (!loanForm.loan_type || !loanForm.loan_amount || !loanForm.tenure_months || !loanForm.start_date) {
      return alert('Loan type, amount, tenure and start date are required');
    }
    setSavingLoan(true);
    try {
      const payload = {
        employee_id: employeeId,
        loan_type: loanForm.loan_type,
        loan_amount: Number(loanForm.loan_amount),
        interest_rate: loanForm.interest_rate ? Number(loanForm.interest_rate) : undefined,
        tenure_months: Number(loanForm.tenure_months),
        start_date: loanForm.start_date,
        status: loanForm.status,
      };
      if (editingLoan?.id) await finance.updateLoan(editingLoan.id, payload);
      else await finance.createLoan(payload);
      setLoanModalOpen(false);
      setEditingLoan(null);
      await loadLoans(employeeId);
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSavingLoan(false);
    }
  };

  const onDeleteLoan = async (row) => {
    if (!window.confirm('Delete this loan?')) return;
    try {
      await finance.deleteLoan(row.id);
      await loadLoans(employeeId);
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  const openRepayments = async (loan) => {
    setRepayLoanId(loan.id);
    setRepayForm({ payment_date: '', amount: '' });
    setRepayments([]);
    setRepayModalOpen(true);
    try {
      const list = await finance.listRepayments({ loan_id: loan.id });
      setRepayments(list);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load repayments');
    }
  };

  const saveRepayment = async (e) => {
    e.preventDefault();
    if (!repayLoanId) return;
    if (!repayForm.payment_date || !repayForm.amount) return alert('Payment date and amount are required');
    setSavingRepay(true);
    try {
      const payload = {
        loan_id: repayLoanId,
        payment_date: repayForm.payment_date,
        amount: Number(repayForm.amount),
      };
      await finance.createRepayment(payload);
      const list = await finance.listRepayments({ loan_id: repayLoanId });
      setRepayments(list);
      setRepayForm({ payment_date: '', amount: '' });
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save repayment');
    } finally {
      setSavingRepay(false);
    }
  };

  const employeeOptions = employees.map((e) => ({
    label: `${e.employee_id} - ${e.first_name} ${e.last_name}`,
    value: e.id,
  }));

  const loanColumns = [
    { key: 'loan_type', header: 'Loan Type' },
    { key: 'loan_amount', header: 'Amount' },
    { key: 'interest_rate', header: 'Interest %' },
    { key: 'tenure_months', header: 'Tenure (months)' },
    { key: 'start_date', header: 'Start Date', accessor: (r) => (r.start_date || '').slice(0, 10) },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditLoan(row)}>Edit</Button>
          <Button size="sm" variant="secondary" onClick={() => openRepayments(row)}>Repayments</Button>
          <Button size="sm" variant="danger" onClick={() => onDeleteLoan(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loan Management</h1>
          <p className="text-sm text-gray-500">Track employee loans and repayments.</p>
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
          <Button onClick={openNewLoan} disabled={!employeeId}>New Loan</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Loans for selected employee.</div>
        </CardHeader>
        <CardContent>
          {!employeeId ? (
            <div className="text-sm text-gray-500">Select an employee to view loans.</div>
          ) : loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : loans.length ? (
            <Table columns={loanColumns} data={loans} showSearch={false} />
          ) : (
            <div className="text-sm text-gray-500">No loans found for this employee.</div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={loanModalOpen}
        onClose={() => { if (!savingLoan) { setLoanModalOpen(false); setEditingLoan(null); } }}
        title={editingLoan ? 'Edit Loan' : 'New Loan'}
      >
        <form className="space-y-3" onSubmit={saveLoan}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Loan Type"
              value={loanForm.loan_type}
              onChange={(e) => setLoanForm((f) => ({ ...f, loan_type: e.target.value }))}
              required
            />
            <Input
              label="Amount"
              type="number"
              value={loanForm.loan_amount}
              onChange={(e) => setLoanForm((f) => ({ ...f, loan_amount: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Interest Rate (%)"
              type="number"
              value={loanForm.interest_rate}
              onChange={(e) => setLoanForm((f) => ({ ...f, interest_rate: e.target.value }))}
            />
            <Input
              label="Tenure (months)"
              type="number"
              value={loanForm.tenure_months}
              onChange={(e) => setLoanForm((f) => ({ ...f, tenure_months: e.target.value }))}
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={loanForm.start_date}
              onChange={(e) => setLoanForm((f) => ({ ...f, start_date: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="border rounded px-3 py-2 text-sm w-full"
                value={loanForm.status}
                onChange={(e) => setLoanForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="active">active</option>
                <option value="closed">closed</option>
                <option value="defaulted">defaulted</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { if (!savingLoan) { setLoanModalOpen(false); setEditingLoan(null); } }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={savingLoan}>{savingLoan ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={repayModalOpen}
        onClose={() => { if (!savingRepay) { setRepayModalOpen(false); setRepayLoanId(''); } }}
        title="Repayments"
      >
        <div className="space-y-3">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end" onSubmit={saveRepayment}>
            <Input
              label="Payment Date"
              type="date"
              value={repayForm.payment_date}
              onChange={(e) => setRepayForm((f) => ({ ...f, payment_date: e.target.value }))}
              required
            />
            <Input
              label="Amount"
              type="number"
              value={repayForm.amount}
              onChange={(e) => setRepayForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
            <Button type="submit" disabled={savingRepay}>{savingRepay ? 'Saving...' : 'Add Repayment'}</Button>
          </form>
          <div className="border-t pt-3 mt-2">
            {repayments.length ? (
              <div className="space-y-2 text-xs">
                {repayments.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border rounded px-2 py-1">
                    <div>
                      <div className="font-medium">{(r.payment_date || '').slice(0, 10)}</div>
                      <div className="text-gray-500">Amount</div>
                    </div>
                    <div className="text-sm font-semibold">{r.amount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No repayments recorded yet.</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
