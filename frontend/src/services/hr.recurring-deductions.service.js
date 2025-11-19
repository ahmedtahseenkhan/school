import api from './api';

export async function list(params = {}) {
  const { data } = await api.get('/hr/recurring-deductions', { params });
  return data.items || [];
}

export async function create(payload) {
  const { data } = await api.post('/hr/recurring-deductions', payload);
  return data.item || data;
}

export async function update(id, payload) {
  const { data } = await api.put(`/hr/recurring-deductions/${id}`, payload);
  return data.item || data;
}

export async function remove(id) {
  const { data } = await api.delete(`/hr/recurring-deductions/${id}`);
  return data;
}
