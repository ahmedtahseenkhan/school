import api from './api';

export async function mark({ employee_id, date, check_in, check_out, status, notes }) {
  const { data } = await api.post('/hr/attendance/mark', { employee_id, date, check_in, check_out, status, notes });
  return data.record;
}

export async function report(params = {}) {
  const { data } = await api.get('/hr/attendance/report', { params });
  return data.records || [];
}

export async function regularize(payload) {
  const { data } = await api.post('/hr/attendance/regularize', payload);
  return data.request;
}

export async function bulk(records = []) {
  const { data } = await api.post('/hr/attendance/bulk', { records });
  return data;
}

export async function listRegularization(params = {}) {
  const { data } = await api.get('/hr/attendance/regularization', { params });
  return data.requests || [];
}

export async function approveRegularization(id, action) {
  const { data } = await api.post(`/hr/attendance/regularization/${id}/approve`, { action });
  return data;
}
