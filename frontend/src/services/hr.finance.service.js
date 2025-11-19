import api from './api';

// Loans
export async function listLoans(params = {}) {
  const { data } = await api.get('/hr/loans', { params });
  return data.items || data.loans || [];
}
export async function createLoan(payload) {
  const { data } = await api.post('/hr/loans', payload);
  return data.item || data.loan || data;
}
export async function updateLoan(id, payload) {
  const { data } = await api.put(`/hr/loans/${id}`, payload);
  return data.item || data.loan || data;
}
export async function deleteLoan(id) {
  await api.delete(`/hr/loans/${id}`);
}

// Repayments
export async function listRepayments(params = {}) {
  const { data } = await api.get('/hr/loan-repayments', { params });
  return data.items || data.repayments || [];
}
export async function createRepayment(payload) {
  const { data } = await api.post('/hr/loan-repayments', payload);
  return data.item || data.repayment || data;
}
