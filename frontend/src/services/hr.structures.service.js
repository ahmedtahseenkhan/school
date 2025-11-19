import api from './api';

export async function listSalaryStructure(params = {}) {
  const { data } = await api.get('/hr/salary-structure', { params });
  return data.items || [];
}

// Leave Quotas
export async function listLeaveQuotas(params = {}) {
  const { data } = await api.get('/hr/leave-quotas', { params });
  return data.items || [];
}

export async function createLeaveQuota(payload) {
  const { data } = await api.post('/hr/leave-quotas', payload);
  return data.item;
}

export async function updateLeaveQuota(id, payload) {
  const { data } = await api.put(`/hr/leave-quotas/${id}`, payload);
  return data.item;
}

export async function deleteLeaveQuota(id) {
  const { data } = await api.delete(`/hr/leave-quotas/${id}`);
  return data;
}
