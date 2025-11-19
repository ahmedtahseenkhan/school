import api from './api';

export async function listPrograms(params = {}) {
  const { data } = await api.get('/hr/training/programs', { params });
  return data.items || [];
}
export async function createProgram(payload) {
  const { data } = await api.post('/hr/training/programs', payload);
  return data.item || data;
}
export async function updateProgram(id, payload) {
  const { data } = await api.put(`/hr/training/programs/${id}`, payload);
  return data.item || data;
}
export async function deleteProgram(id) {
  await api.delete(`/hr/training/programs/${id}`);
}

export async function listParticipants(params = {}) {
  const { data } = await api.get('/hr/training/participants', { params });
  return data.items || [];
}
export async function addParticipant(payload) {
  const { data } = await api.post('/hr/training/participants', payload);
  return data.item || data;
}
export async function updateParticipant(id, payload) {
  const { data } = await api.put(`/hr/training/participants/${id}`, payload);
  return data.item || data;
}
export async function removeParticipant(id) {
  await api.delete(`/hr/training/participants/${id}`);
}
