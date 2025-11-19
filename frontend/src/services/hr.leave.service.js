import api from './api';

export async function apply(payload) {
  const { data } = await api.post('/hr/leave/apply', payload);
  return data.application;
}

export async function listApplications(params = {}) {
  const { data } = await api.get('/hr/leave/applications', { params });
  return data.applications || [];
}

export async function approve(id, status, rejection_reason) {
  const { data } = await api.post(`/hr/leave/applications/${id}/approve`, { status, rejection_reason });
  return data.application;
}

export async function balance(params = {}) {
  const { data } = await api.get('/hr/leave/balance', { params });
  return data.balances || [];
}

export async function listAdjustments(params = {}) {
  const { data } = await api.get('/hr/leave/adjustments', { params });
  return data.items || [];
}

export async function createAdjustment(payload) {
  const { data } = await api.post('/hr/leave/adjustments', payload);
  return data.item;
}
