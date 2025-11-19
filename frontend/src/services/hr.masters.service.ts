import api from './api.js';

export type Department = { id: string; name: string };
export type Designation = { id: string; title: string };
export type LeaveType = { id: string; name: string };
export type HolidayType = { id: string; code: string; name: string; description?: string; color?: string; is_active?: boolean };
export type CalendarHoliday = { id: string; code: string; name: string; payroll_register?: string; payroll_period?: string; apply_on?: string; year?: number; period_label?: string; start_date?: string; end_date?: string };
export type AttendancePolicy = { id: string; code: string; name: string; policy_type: string; calculate_on?: string; apply_on_off_days?: boolean; description?: string };
export type AttendanceDevice = { id: string; device_name: string; device_id: string; device_type?: string; location?: string; ip_address?: string; branch_id?: string; is_active?: boolean };
export type Shift = { id: string; name: string; code?: string; shift_type?: string; start_time?: string; end_time?: string; break_duration_minutes?: number; is_active?: boolean };
export type SalaryComponent = { id: string; name: string; type: 'earning' | 'deduction'; calculation_type: 'fixed' | 'percentage' | 'variable'; is_taxable: boolean; is_active: boolean };

export async function listDepartments() {
  const { data } = await api.get('/hr/departments');
  return (data.items || []) as Department[];
}

export async function listDesignations() {
  const { data } = await api.get('/hr/designations');
  return (data.items || []) as Designation[];
}

export async function listLeaveTypes() {
  const { data } = await api.get('/hr/leave-types');
  return (data.items || []) as LeaveType[];
}

export async function listHolidayTypes() {
  const { data } = await api.get('/hr/holiday-types');
  return (data.items || []) as HolidayType[];
}

export async function listCalendarHolidays() {
  const { data } = await api.get('/hr/calendar-holidays');
  return (data.items || []) as CalendarHoliday[];
}

export async function listAttendancePolicies() {
  const { data } = await api.get('/hr/attendance-policies');
  return (data.items || []) as AttendancePolicy[];
}

export async function listAttendanceDevices() {
  const { data } = await api.get('/hr/attendance-devices');
  return (data.items || []) as AttendanceDevice[];
}

export async function createLeaveType(payload: Partial<LeaveType> & { name: string; code: string }) {
  const { data } = await api.post('/hr/leave-types', payload);
  return data.item as LeaveType;
}

export async function createHolidayType(payload: Partial<HolidayType> & { code: string; name: string }) {
  const { data } = await api.post('/hr/holiday-types', payload);
  return data.item as HolidayType;
}

export async function createCalendarHoliday(payload: Partial<CalendarHoliday> & { code: string; name: string }) {
  const { data } = await api.post('/hr/calendar-holidays', payload);
  return data.item as CalendarHoliday;
}

export async function createAttendancePolicy(payload: Partial<AttendancePolicy> & { code: string; name: string; policy_type: string }) {
  const { data } = await api.post('/hr/attendance-policies', payload);
  return data.item as AttendancePolicy;
}

export async function createAttendanceDevice(payload: Partial<AttendanceDevice> & { device_name: string; device_id: string }) {
  const { data } = await api.post('/hr/attendance-devices', payload);
  return data.item as AttendanceDevice;
}

export async function updateLeaveType(id: string, payload: Partial<LeaveType>) {
  const { data } = await api.put(`/hr/leave-types/${id}`, payload);
  return data.item as LeaveType;
}

export async function updateHolidayType(id: string, payload: Partial<HolidayType>) {
  const { data } = await api.put(`/hr/holiday-types/${id}`, payload);
  return data.item as HolidayType;
}

export async function updateCalendarHoliday(id: string, payload: Partial<CalendarHoliday>) {
  const { data } = await api.put(`/hr/calendar-holidays/${id}`, payload);
  return data.item as CalendarHoliday;
}

export async function updateAttendancePolicy(id: string, payload: Partial<AttendancePolicy>) {
  const { data } = await api.put(`/hr/attendance-policies/${id}`, payload);
  return data.item as AttendancePolicy;
}

export async function updateAttendanceDevice(id: string, payload: Partial<AttendanceDevice>) {
  const { data } = await api.put(`/hr/attendance-devices/${id}`, payload);
  return data.item as AttendanceDevice;
}

export async function deleteLeaveType(id: string) {
  const { data } = await api.delete(`/hr/leave-types/${id}`);
  return data;
}

export async function deleteHolidayType(id: string) {
  const { data } = await api.delete(`/hr/holiday-types/${id}`);
  return data;
}

export async function deleteCalendarHoliday(id: string) {
  const { data } = await api.delete(`/hr/calendar-holidays/${id}`);
  return data;
}

export async function deleteAttendancePolicy(id: string) {
  const { data } = await api.delete(`/hr/attendance-policies/${id}`);
  return data;
}

export async function deleteAttendanceDevice(id: string) {
  const { data } = await api.delete(`/hr/attendance-devices/${id}`);
  return data;
}

export async function listShifts() {
  const { data } = await api.get('/hr/shifts');
  return (data.items || []) as Shift[];
}

export async function createDepartment(payload: Partial<Department> & { name: string }) {
  const { data } = await api.post('/hr/departments', payload);
  return data.item as Department;
}

export async function updateDepartment(id: string, payload: Partial<Department>) {
  const { data } = await api.put(`/hr/departments/${id}`, payload);
  return data.item as Department;
}

export async function deleteDepartment(id: string) {
  const { data } = await api.delete(`/hr/departments/${id}`);
  return data;
}

export async function createDesignation(payload: Partial<Designation> & { title: string }) {
  const { data } = await api.post('/hr/designations', payload);
  return data.item as Designation;
}

export async function updateDesignation(id: string, payload: Partial<Designation>) {
  const { data } = await api.put(`/hr/designations/${id}`, payload);
  return data.item as Designation;
}

export async function deleteDesignation(id: string) {
  const { data } = await api.delete(`/hr/designations/${id}`);
  return data;
}

export async function createShift(payload: Partial<Shift> & { name: string; start_time: string; end_time: string; break_duration_minutes?: number; is_active?: boolean }) {
  const { data } = await api.post('/hr/shifts', payload);
  return data.item as Shift;
}

export async function updateShift(id: string, payload: Partial<Shift> & { start_time?: string; end_time?: string; break_duration_minutes?: number; is_active?: boolean }) {
  const { data } = await api.put(`/hr/shifts/${id}`, payload);
  return data.item as Shift;
}

export async function deleteShift(id: string) {
  const { data } = await api.delete(`/hr/shifts/${id}`);
  return data;
}

export async function listSalaryComponents() {
  const { data } = await api.get('/hr/salary-components');
  return (data.items || []) as SalaryComponent[];
}

export async function createSalaryComponent(payload: Partial<SalaryComponent> & { name: string; type: 'earning'|'deduction'; calculation_type: 'fixed'|'percentage'|'variable' }) {
  const { data } = await api.post('/hr/salary-components', payload);
  return data.item as SalaryComponent;
}

export async function updateSalaryComponent(id: string, payload: Partial<SalaryComponent>) {
  const { data } = await api.put(`/hr/salary-components/${id}`, payload);
  return data.item as SalaryComponent;
}

export async function deleteSalaryComponent(id: string) {
  const { data } = await api.delete(`/hr/salary-components/${id}`);
  return data;
}
