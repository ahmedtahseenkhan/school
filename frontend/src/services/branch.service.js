import api from './api';

export async function list() {
  const { data } = await api.get('/branches');
  return data.branches || data || [];
}

export async function get(id) {
  const { data } = await api.get(`/branches/${id}`);
  return data.branch || data;
}

export async function create(payload) {
  const { data } = await api.post('/branches', payload);
  return data.branch || data;
}

export async function update(id, payload) {
  const { data } = await api.put(`/branches/${id}`, payload);
  return data.branch || data;
}

export async function remove(id) {
  const { data } = await api.delete(`/branches/${id}`);
  return data;
}

export async function listAdmins(branchId) {
  const { data } = await api.get(`/branches/${branchId}/admins`);
  return data.admins || [];
}

export async function assignAdmin(branchId, payload) {
  const { data } = await api.post(`/branches/${branchId}/admins`, payload);
  return data.assignment;
}

export async function removeAdmin(branchId, userId) {
  const { data } = await api.delete(`/branches/${branchId}/admins/${userId}`);
  return data;
}

export async function switchBranch({ branch_id, branch_code = null }) {
  const { data } = await api.post('/branches/switch', { branch_id, branch_code });
  const selected = data.selected || null;
  if (selected?.id) {
    localStorage.setItem('branch_id', selected.id);
  }
  return selected;
}
