import api from './api.js';

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  branch_id?: string | null;
};

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get('/rbac/users');
  return data.users as User[];
}
