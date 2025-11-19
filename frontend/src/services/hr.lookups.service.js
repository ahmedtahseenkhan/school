import api from './api';

export async function list(category, params = {}) {
  const { data } = await api.get(`/hr/lookups/${encodeURIComponent(category)}`, { params });
  return data.items || [];
}

export async function create(category, payload) {
  const { data } = await api.post(`/hr/lookups/${encodeURIComponent(category)}`, payload);
  return data.item || data;
}

export async function update(category, id, payload) {
  const { data } = await api.put(`/hr/lookups/${encodeURIComponent(category)}/${id}`, payload);
  return data.item || data;
}

export async function remove(category, id) {
  const { data } = await api.delete(`/hr/lookups/${encodeURIComponent(category)}/${id}`);
  return data;
}
