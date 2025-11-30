import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/Calendar';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import * as attendanceService from '@/services/hr.attendance.service';
import * as employeeService from '@/services/hr.service';
import * as departmentService from '@/services/hr.masters.service';
import { Download, Filter } from 'lucide-react';

const ATTENDANCE_STATUS = {
  PRESENT: { label: 'Present', color: '#10b981', bgColor: '#d1fae5' },
  ABSENT: { label: 'Absent', color: '#ef4444', bgColor: '#fee2e2' },
  LATE: { label: 'Late', color: '#f59e0b', bgColor: '#fef3c7' },
  HALF_DAY: { label: 'Half Day', color: '#8b5cf6', bgColor: '#ede9fe' },
  LEAVE: { label: 'Leave', color: '#3b82f6', bgColor: '#dbeafe' },
  HOLIDAY: { label: 'Holiday', color: '#6b7280', bgColor: '#f3f4f6' },
};

export default function AttendanceCalendar() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    employeeId: '',
    departmentId: '',
    month: new Date(),
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filters.employeeId || filters.departmentId) {
      loadAttendanceData();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        employeeService.getEmployees(),
        departmentService.listDepartments(),
      ]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(filters.month.getFullYear(), filters.month.getMonth(), 1);
      const endDate = new Date(filters.month.getFullYear(), filters.month.getMonth() + 1, 0);

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };

      if (filters.employeeId) {
        params.employeeId = filters.employeeId;
      }
      if (filters.departmentId) {
        params.departmentId = filters.departmentId;
      }

      const response = await attendanceService.getAttendanceReport(params);

      // Transform attendance data to calendar events
      const events = (response.data || []).map(record => ({
        date: record.date,
        type: record.status,
        data: {
          title: record.employee_name || 'Unknown',
          status: record.status,
          checkIn: record.check_in_time,
          checkOut: record.check_out_time,
          workHours: record.work_hours,
          employeeId: record.employee_id,
        },
      }));

      setAttendanceData(events);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDay = (date, dayEvents) => {
    if (dayEvents.length === 0) return null;

    // Group events by status
    const statusCounts = dayEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="space-y-1">
        {Object.entries(statusCounts).map(([status, count]) => {
          const statusConfig = ATTENDANCE_STATUS[status] || ATTENDANCE_STATUS.PRESENT;
          return (
            <div
              key={status}
              className="text-xs px-2 py-1 rounded flex items-center justify-between"
              style={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.color,
              }}
            >
              <span className="font-medium">{statusConfig.label}</span>
              {count > 1 && <span className="text-xs">×{count}</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const handleDateClick = (date, dayEvents) => {
    if (dayEvents.length === 0) return;

    // Show details modal or tooltip
    console.log('Date clicked:', date, dayEvents);
    // TODO: Implement modal with detailed attendance information
  };

  const handleExport = () => {
    // TODO: Implement export to PDF/Excel
    console.log('Export attendance calendar');
  };

  const colorMap = Object.entries(ATTENDANCE_STATUS).reduce((acc, [key, value]) => {
    acc[key] = value.bgColor;
    return acc;
  }, {});

  const legend = (
    <div className="flex flex-wrap gap-4">
      {Object.entries(ATTENDANCE_STATUS).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: value.bgColor, border: `2px solid ${value.color}` }}
          />
          <span className="text-sm text-gray-700">{value.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            View attendance records in a monthly calendar format
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select
                value={filters.departmentId}
                onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <Select
                value={filters.employeeId}
                onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                disabled={!filters.departmentId && employees.length > 50}
              >
                <option value="">
                  {filters.departmentId ? 'All Employees' : 'Select Department First'}
                </option>
                {employees
                  .filter(emp => !filters.departmentId || emp.department_id == filters.departmentId)
                  .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} - {emp.employee_code}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          {!filters.employeeId && !filters.departmentId && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please select a department or employee to view attendance data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar */}
      {(filters.employeeId || filters.departmentId) && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">Loading attendance data...</div>
            </div>
          ) : (
            <Calendar
              events={attendanceData}
              renderDay={renderDay}
              colorMap={colorMap}
              initialMonth={filters.month}
              onDateClick={handleDateClick}
              legend={legend}
            />
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {attendanceData.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Monthly Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(ATTENDANCE_STATUS).map(([key, value]) => {
                const count = attendanceData.filter(e => e.type === key).length;
                return (
                  <div key={key} className="text-center p-4 rounded-lg" style={{ backgroundColor: value.bgColor }}>
                    <div className="text-2xl font-bold" style={{ color: value.color }}>
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{value.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
