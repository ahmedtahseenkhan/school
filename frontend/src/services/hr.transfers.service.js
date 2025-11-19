import api from './api';

export async function list(params = {}) {
  const { data } = await api.get('/hr/employee-transfers', { params });
  return data.items || [];
}

export async function create(payload) {
  const { data } = await api.post('/hr/employee-transfers', payload);
  return data.item || data;
}

export async function update(id, payload) {
  const { data } = await api.put(`/hr/employee-transfers/${id}`, payload);
  return data.item || data;
}
