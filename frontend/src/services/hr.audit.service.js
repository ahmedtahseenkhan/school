import api from './api';

export async function list(params = {}) {
  const { data } = await api.get('/hr/audit-log', { params });
  return data.items || [];
}
