import api from './api';

export async function list(params = {}) {
  const { data } = await api.get('/hr/salary-structure', { params });
  return data.items || [];
}

export async function create(payload) {
  const { data } = await api.post('/hr/salary-structure', payload);
  return data.item || data;
}

export async function update(id, payload) {
  const { data } = await api.put(`/hr/salary-structure/${id}`, payload);
  return data.item || data;
}

export async function remove(id) {
  const { data } = await api.delete(`/hr/salary-structure/${id}`);
  return data;
}
