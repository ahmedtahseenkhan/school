import api from './api';

export async function listRoles() {
  const { data } = await api.get('/rbac/roles');
  return data.roles || [];
}

export async function listPermissions() {
  const { data } = await api.get('/rbac/permissions');
  return data.permissions || [];
}

export async function getRolePermissions(roleId) {
  const { data } = await api.get(`/rbac/roles/${roleId}/permissions`);
  return data.permissions || [];
}

export async function setRolePermissions(roleId, permissionNames) {
  await api.post(`/rbac/roles/${roleId}/permissions`, { permissions: permissionNames });
}

export async function listUsers() {
  const { data } = await api.get('/rbac/users');
  return data.users || [];
}

export async function getUserOverrides(userId) {
  const { data } = await api.get(`/rbac/users/${userId}/permissions`);
  return data.overrides || [];
}

export async function setUserOverrides(userId, overrides) {
  await api.post(`/rbac/users/${userId}/permissions`, { overrides });
}

export async function myPermissions() {
  const { data } = await api.get('/rbac/permissions/me');
  return data.permissions || [];
}

export async function listModules() {
  const { data } = await api.get('/rbac/modules');
  return data.modules || [];
}

export async function setModuleEnabled(slug, isEnabled) {
  await api.put(`/modules/${slug}/enabled`, { is_enabled: !!isEnabled });
}
