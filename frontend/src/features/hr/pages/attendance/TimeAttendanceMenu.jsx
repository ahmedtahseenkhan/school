import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { NavLink } from 'react-router-dom';

const Section = ({ title, items }) => (
  <div className="space-y-3 min-w-[180px]">
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</div>
    <div className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-2 text-sm px-2 py-1.5 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
              isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' : 'text-gray-700 dark:text-gray-200'
            }`
          }
        >
          <span className="text-xs text-gray-400">≡</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  </div>
);

export default function TimeAttendanceMenu() {
  const setupItems = [
    { label: 'Holiday Type', to: '/admin/hr/attendance/holiday-types' },
    { label: 'Calendar Holidays', to: '/admin/hr/attendance/calendar-holidays' },
    { label: 'Attendance Policies', to: '/admin/hr/attendance/policies' },
    { label: 'Shift', to: '/admin/hr/masters/shifts' },
    { label: 'Device Registration', to: '/admin/hr/attendance/devices' },
    { label: 'Custom Schedule', to: '/admin/hr/attendance/custom-schedule' },
  ];

  const leaveItems = [
    { label: 'Leave Type', to: '/admin/hr/masters/leave-types' },
    { label: 'Leave Request', to: '/admin/hr/leave/apply' },
    { label: 'Leave Quota Allocation', to: '/admin/hr/leave/quotas' },
    { label: 'Leave Adjustment', to: '/admin/hr/leave/adjustments' },
  ];

  const attendanceItems = [
    { label: 'Employee Attendance', to: '/admin/hr/attendance/employee' },
    { label: 'Attendance Request', to: '/admin/hr/attendance/regularization' },
  ];

  const processItems = [
    // Future: Daily Attendance Process, Daily Attendance Data, Monthly Attendance Data
    { label: 'Attendance Report', to: '/admin/hr/attendance/report' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Time & Attendance</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">Quick access to all Time & Attendance setup, leave, attendance, and process modules.</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Section title="Setup" items={setupItems} />
            <Section title="Leave" items={leaveItems} />
            <Section title="Attendance" items={attendanceItems} />
            <Section title="Process" items={processItems} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
