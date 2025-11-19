import api from './api';

export async function myPermissions() {
  const { data } = await api.get('/rbac/permissions/me');
  return (data.permissions || []);
}
