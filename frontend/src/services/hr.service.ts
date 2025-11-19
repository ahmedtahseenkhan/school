import api from './api.js';

export type Employee = {
  id: string;
  branch_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  department?: string | null;
  designation?: string | null;
  employment_status?: string;
};

export async function listEmployees(params: Record<string, any> = {}): Promise<Employee[]> {
  const { data } = await api.get('/hr/employees', { params });
  return data.employees || [];
}

export async function createEmployee(payload: Partial<Employee> & { joining_date: string }): Promise<Employee> {
  const { data } = await api.post('/hr/employees', payload);
  return data.employee;
}

export async function updateEmployee(id: string, payload: Partial<Employee>): Promise<Employee> {
  const { data } = await api.put(`/hr/employees/${id}`, payload);
  return data.employee;
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/hr/employees/${id}`);
}

export async function getEmployee(id: string): Promise<any> {
  const { data } = await api.get(`/hr/employees/${id}`);
  return data.employee;
}
