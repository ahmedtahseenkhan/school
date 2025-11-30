import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/Calendar';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import * as leaveService from '@/services/hr.leave.service';
import * as employeeService from '@/services/hr.service';
import * as departmentService from '@/services/hr.masters.service';
import { Download, Filter, Printer } from 'lucide-react';

const LEAVE_TYPES = {
  CASUAL: { label: 'Casual Leave', color: '#3b82f6', bgColor: '#dbeafe' },
  SICK: { label: 'Sick Leave', color: '#ef4444', bgColor: '#fee2e2' },
  ANNUAL: { label: 'Annual Leave', color: '#10b981', bgColor: '#d1fae5' },
  MATERNITY: { label: 'Maternity Leave', color: '#ec4899', bgColor: '#fce7f3' },
  PATERNITY: { label: 'Paternity Leave', color: '#8b5cf6', bgColor: '#ede9fe' },
  UNPAID: { label: 'Unpaid Leave', color: '#6b7280', bgColor: '#f3f4f6' },
  COMPENSATORY: { label: 'Compensatory Off', color: '#f59e0b', bgColor: '#fef3c7' },
};

const APPROVAL_STATUS = {
  PENDING: { label: 'Pending', icon: '⏳', color: '#f59e0b' },
  APPROVED: { label: 'Approved', icon: '✓', color: '#10b981' },
  REJECTED: { label: 'Rejected', icon: '✗', color: '#ef4444' },
};

export default function LeaveCalendar() {
  const [leaveData, setLeaveData] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    departmentId: '',
    leaveTypeId: '',
    approvalStatus: '',
    month: new Date(),
  });

  const [viewMode, setViewMode] = useState('team'); // 'team' or 'individual'

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadLeaveData();
  }, [filters, viewMode]);

  const loadInitialData = async () => {
    try {
      const [empRes, deptRes, leaveTypesRes] = await Promise.all([
        employeeService.getEmployees(),
        departmentService.listDepartments(),
        departmentService.listLeaveTypes(),
      ]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setLeaveTypes(leaveTypesRes.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(filters.month.getFullYear(), filters.month.getMonth(), 1);
      const endDate = new Date(filters.month.getFullYear(), filters.month.getMonth() + 1, 0);

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };

      if (filters.departmentId) {
        params.departmentId = filters.departmentId;
      }
      if (filters.leaveTypeId) {
        params.leaveTypeId = filters.leaveTypeId;
      }
      if (filters.approvalStatus) {
        params.status = filters.approvalStatus;
      }

      const response = await leaveService.getLeaveApplications(params);

      // Transform leave data to calendar events
      // Each leave application may span multiple days
      const events = [];
      (response.data || []).forEach(leave => {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);

        // Create an event for each day in the leave period
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          events.push({
            date: new Date(d),
            type: leave.leave_type_name || 'CASUAL',
            data: {
              title: `${leave.employee_name} - ${leave.leave_type_name}`,
              employeeName: leave.employee_name,
              leaveType: leave.leave_type_name,
              status: leave.status,
              reason: leave.reason,
              days: leave.total_days,
              startDate: leave.start_date,
              endDate: leave.end_date,
              employeeId: leave.employee_id,
              leaveId: leave.id,
            },
          });
        }
      });

      setLeaveData(events);
    } catch (error) {
      console.error('Error loading leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDay = (date, dayEvents) => {
    if (dayEvents.length === 0) return null;

    if (viewMode === 'team') {
      // Show count by leave type
      const typeCounts = dayEvents.reduce((acc, event) => {
        const type = event.data.leaveType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return (
        <div className="space-y-1">
          {Object.entries(typeCounts).slice(0, 3).map(([type, count]) => {
            const leaveConfig = Object.values(LEAVE_TYPES).find(lt => lt.label === type) || LEAVE_TYPES.CASUAL;
            return (
              <div
                key={type}
                className="text-xs px-1.5 py-0.5 rounded flex items-center justify-between"
                style={{
                  backgroundColor: leaveConfig.bgColor,
                  color: leaveConfig.color,
                }}
              >
                <span className="truncate font-medium">{type}</span>
                {count > 1 && <span className="ml-1">×{count}</span>}
              </div>
            );
          })}
          {Object.keys(typeCounts).length > 3 && (
            <div className="text-xs text-gray-500">+{Object.keys(typeCounts).length - 3} more</div>
          )}
        </div>
      );
    } else {
      // Show individual leave entries with status
      return (
        <div className="space-y-1">
          {dayEvents.slice(0, 2).map((event, idx) => {
            const leaveConfig = Object.values(LEAVE_TYPES).find(lt => lt.label === event.data.leaveType) || LEAVE_TYPES.CASUAL;
            const statusConfig = APPROVAL_STATUS[event.data.status] || APPROVAL_STATUS.PENDING;

            return (
              <div
                key={idx}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: leaveConfig.bgColor,
                  color: leaveConfig.color,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{event.data.employeeName}</span>
                  <span title={statusConfig.label}>{statusConfig.icon}</span>
                </div>
              </div>
            );
          })}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
          )}
        </div>
      );
    }
  };

  const handleDateClick = (date, dayEvents) => {
    if (dayEvents.length === 0) return;

    // Show details modal
    console.log('Date clicked:', date, dayEvents);
    // TODO: Implement modal with detailed leave information
  };

  const handleExport = () => {
    // TODO: Implement export to PDF/Excel
    console.log('Export leave calendar');
  };

  const handlePrint = () => {
    window.print();
  };

  const colorMap = Object.entries(LEAVE_TYPES).reduce((acc, [key, value]) => {
    acc[value.label] = value.bgColor;
    return acc;
  }, {});

  const legend = (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Leave Types</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(LEAVE_TYPES).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: value.bgColor, border: `2px solid ${value.color}` }}
              />
              <span className="text-sm text-gray-700">{value.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Approval Status</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(APPROVAL_STATUS).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-lg">{value.icon}</span>
              <span className="text-sm text-gray-700">{value.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            View team leave schedules and employee absences
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'team' ? 'primary' : 'outline'}
                onClick={() => setViewMode('team')}
              >
                Team View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'individual' ? 'primary' : 'outline'}
                onClick={() => setViewMode('individual')}
              >
                Individual View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Leave Type
              </label>
              <Select
                value={filters.leaveTypeId}
                onChange={(e) => setFilters({ ...filters, leaveTypeId: e.target.value })}
              >
                <option value="">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Status
              </label>
              <Select
                value={filters.approvalStatus}
                onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Loading leave data...</div>
          </div>
        ) : (
          <Calendar
            events={leaveData}
            renderDay={renderDay}
            colorMap={colorMap}
            initialMonth={filters.month}
            onDateClick={handleDateClick}
            legend={legend}
          />
        )}
      </div>

      {/* Summary Statistics */}
      {leaveData.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Monthly Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(leaveData.map(e => e.data.leaveId)).size}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Leave Applications</div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(leaveData.filter(e => e.data.status === 'APPROVED').map(e => e.data.leaveId)).size}
                </div>
                <div className="text-sm text-gray-600 mt-1">Approved</div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {new Set(leaveData.filter(e => e.data.status === 'PENDING').map(e => e.data.leaveId)).size}
                </div>
                <div className="text-sm text-gray-600 mt-1">Pending</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(leaveData.map(e => e.data.employeeId)).size}
                </div>
                <div className="text-sm text-gray-600 mt-1">Employees on Leave</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
