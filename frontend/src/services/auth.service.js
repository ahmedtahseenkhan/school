import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function me(token) {
  const { data } = await api.get('/auth/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return data;
}
