import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const branchId = localStorage.getItem('branch_id');
  if (branchId) config.headers['X-Branch-Id'] = branchId;
  return config;
});

export default api;
