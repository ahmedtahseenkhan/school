import api from './api';

export async function process(payload) {
  const { data } = await api.post('/hr/payroll/process', payload);
  return data;
}

export async function payslip(employeeId, params = {}) {
  const { data } = await api.get(`/hr/payroll/${employeeId}/payslip`, { params });
  return data;
}

export async function report(params = {}) {
  const { data } = await api.get('/hr/payroll/report', { params });
  return data.summary || {};
}

export async function taxReport(params = {}) {
  const { data } = await api.get('/hr/payroll/tax-report', { params });
  return data;
}

export async function listPeriods(params = {}) {
  const { data } = await api.get('/hr/payroll/periods', { params });
  return data.items || [];
}

export async function getPeriod(id) {
  const { data } = await api.get(`/hr/payroll/periods/${id}`);
  return data.item || data;
}

export async function updatePeriod(id, payload) {
  const { data } = await api.put(`/hr/payroll/periods/${id}`, payload);
  return data.item || data;
}

export async function register(periodId, params = {}) {
  const { data } = await api.get(`/hr/payroll/periods/${periodId}/register`, { params });
  return data;
}
