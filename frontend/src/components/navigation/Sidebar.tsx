import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, Cog6ToothIcon, XMarkIcon, BriefcaseIcon, ShieldCheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { usePermission } from '@/contexts/PermissionContext.jsx';

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  end?: boolean;
  anyOf?: string[];
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    label: undefined,
    items: [
      { to: '/admin', label: 'Dashboard', icon: HomeIcon, end: true },
      { to: '/admin/users', label: 'Users', icon: UsersIcon, anyOf: ['user:read', '*:manage'] }
    ]
  },
  {
    label: 'HR Management',
    items: [
      { to: '/admin/hr/employees', label: 'Employees', icon: BriefcaseIcon, anyOf: ['module:hr:access','hr.employee:read','*:manage'] },
      { to: '/admin/hr/employees/transfers', label: 'Employee Transfers', icon: BriefcaseIcon, anyOf: ['hr.employee:read','hr.employee:update','*:manage'] },
      { to: '/admin/hr/masters/departments', label: 'Departments', icon: BriefcaseIcon, anyOf: ['hr.department:read','*:manage'] },
      { to: '/admin/hr/masters/designations', label: 'Designations', icon: BriefcaseIcon, anyOf: ['hr.designation:read','*:manage'] },
      { to: '/admin/permissions/roles', label: 'Roles & Permissions', icon: ShieldCheckIcon, anyOf: ['*:manage'] }
    ]
  },
  {
    label: 'Time & Attendance',
    items: [
      { to: '/admin/hr/time-attendance', label: 'Attendance Dashboard', icon: BriefcaseIcon, anyOf: ['module:hr:access','hr.attendance:report','*:manage'] },
      { to: '/admin/hr/attendance/employee', label: 'Employee Attendance', icon: BriefcaseIcon, anyOf: ['hr.attendance:report','hr.attendance:mark','*:manage'] },
      { to: '/admin/hr/attendance/regularization', label: 'Attendance Requests', icon: BriefcaseIcon, anyOf: ['hr.attendance:regularize','*:manage'] },
      { to: '/admin/hr/attendance/report', label: 'Attendance Reports', icon: BriefcaseIcon, anyOf: ['hr.attendance:report','hr.attendance:mark','*:manage'] },
      { to: '/admin/hr/masters/shifts', label: 'Shifts', icon: BriefcaseIcon, anyOf: ['hr.shift:read','*:manage'] },
      { to: '/admin/hr/attendance/policies', label: 'Attendance Policies', icon: BriefcaseIcon, anyOf: ['hr.attendance_policy:read','*:manage'] },
      { to: '/admin/hr/attendance/calendar-holidays', label: 'Calendar Holidays', icon: BriefcaseIcon, anyOf: ['hr.calendar_holiday:read','*:manage'] },
      { to: '/admin/hr/attendance/holiday-types', label: 'Holiday Types', icon: BriefcaseIcon, anyOf: ['hr.holiday_type:read','*:manage'] },
      { to: '/admin/hr/attendance/custom-schedule', label: 'Custom Schedules', icon: BriefcaseIcon, anyOf: ['hr.custom_schedule:read','*:manage'] },
      { to: '/admin/hr/attendance/devices', label: 'Device Registration', icon: BriefcaseIcon, anyOf: ['hr.attendance_device:read','*:manage'] }
    ]
  },
  {
    label: 'Leave Management',
    items: [
      { to: '/admin/hr/masters/leave-types', label: 'Leave Types', icon: BriefcaseIcon, anyOf: ['hr.leave_type:read','*:manage'] },
      { to: '/admin/hr/leave/apply', label: 'Leave Requests', icon: BriefcaseIcon, anyOf: ['hr.leave:apply','*:manage'] },
      { to: '/admin/hr/leave/quotas', label: 'Leave Quota Allocation', icon: BriefcaseIcon, anyOf: ['hr.leave_quota:read','*:manage'] },
      { to: '/admin/hr/leave/adjustments', label: 'Leave Adjustments', icon: BriefcaseIcon, anyOf: ['hr.leave:read','*:manage'] },
      { to: '/admin/hr/leave/balance', label: 'Leave Balance', icon: BriefcaseIcon, anyOf: ['hr.leave:read','*:manage'] }
    ]
  },
  {
    label: 'Payroll',
    items: [
      { to: '/admin/hr/payroll/salary-structure', label: 'Salary Structure', icon: BriefcaseIcon, anyOf: ['hr.salary_structure:read','*:manage'] },
      { to: '/admin/hr/payroll/processing', label: 'Monthly Payroll', icon: BriefcaseIcon, anyOf: ['hr.payroll:read','hr.payroll:process','*:manage'] },
      { to: '/admin/hr/payroll/summary', label: 'Payroll Summary', icon: BriefcaseIcon, anyOf: ['hr.payroll:read','*:manage'] },
      { to: '/admin/hr/payroll/periods', label: 'Payroll Periods', icon: BriefcaseIcon, anyOf: ['hr.payroll:read','*:manage'] },
      { to: '/admin/hr/payroll/register', label: 'Payroll Register', icon: BriefcaseIcon, anyOf: ['hr.payroll:read','*:manage'] },
      { to: '/admin/hr/payroll/payslips', label: 'Payslips', icon: BriefcaseIcon, anyOf: ['hr.payroll:read','*:manage'] },
      { to: '/admin/hr/payroll/loans', label: 'Loans & Advances', icon: BriefcaseIcon, anyOf: ['hr.loan:read','*:manage'] },
      { to: '/admin/hr/payroll/loan-reports', label: 'Loan Reports', icon: BriefcaseIcon, anyOf: ['hr.loan:read','*:manage'] },
      { to: '/admin/hr/payroll/tax-deductions', label: 'Tax & Deduction Reports', icon: BriefcaseIcon, anyOf: ['hr.payroll:read','*:manage'] },
      { to: '/admin/hr/payroll/recurring-deductions', label: 'Recurring Deductions', icon: BriefcaseIcon, anyOf: ['hr.payroll:read','hr.payroll:process','*:manage'] },
      { to: '/admin/hr/payroll/audit-log', label: 'Payroll Audit Log', icon: BriefcaseIcon, anyOf: ['hr.payroll:read','*:manage'] }
    ]
  },
  {
    label: 'Performance Management',
    items: [
      { to: '/admin/hr/performance/reviews', label: 'Performance Reviews', icon: BriefcaseIcon, anyOf: ['hr.performance:read','*:manage'] },
      { to: '/admin/hr/performance/goals', label: 'Goals', icon: BriefcaseIcon, anyOf: ['hr.performance:read','*:manage'] },
      { to: '/admin/hr/performance/appraisals', label: 'KPI Templates', icon: BriefcaseIcon, anyOf: ['hr.performance:read','*:manage'] }
    ]
  },
  {
    label: 'Recruitment',
    items: [
      { to: '/admin/hr/recruitment/job-postings', label: 'Job Posts', icon: BriefcaseIcon, anyOf: ['hr.job_posting:read','*:manage'] },
      { to: '/admin/hr/recruitment/applicants', label: 'Applicants', icon: BriefcaseIcon, anyOf: ['hr.applicant:read','*:manage'] },
      { to: '/admin/hr/recruitment/interviews', label: 'Hiring Stages', icon: BriefcaseIcon, anyOf: ['hr.interview:read','*:manage'] }
    ]
  },
  {
    label: 'Settings',
    items: [
      { to: '/admin/settings', label: 'General Settings', icon: Cog6ToothIcon },
      { to: '/admin/settings/lookups', label: 'Lookups', icon: Cog6ToothIcon, anyOf: ['hr.lookup:read','*:manage'] },
      { to: '/admin/permissions/modules', label: 'Modules', icon: ShieldCheckIcon, anyOf: ['*:manage'] }
    ]
  }
];

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { hasAny, loading } = usePermission();

  const [openSection, setOpenSection] = React.useState<string | null>(null);

  const visibleSections = React.useMemo(() => {
    if (loading) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((it) => !it.anyOf || (hasAny as any)(it.anyOf as any))
      }))
      .filter((section) => section.items.length > 0);
  }, [hasAny, loading]);
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 min-h-screen">
        <div className="h-14 flex items-center px-4 text-lg font-semibold">School Admin</div>
        <nav className="px-2 py-3 space-y-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {visibleSections.map((section, idx) => {
            const isRootSection = !section.label;
            const sectionKey = section.label || `section-${idx}`;
            const isOpen = isRootSection || openSection === sectionKey;

            return (
              <div key={idx} className="space-y-1">
                {section.label && (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSection((prev) => (prev === sectionKey ? null : sectionKey))
                    }
                    className="w-full flex items-center justify-between px-3 py-1.5 uppercase tracking-wide text-[0.68rem] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <span>{section.label}</span>
                    <ChevronDownIcon
                      className={clsx(
                        'h-3.5 w-3.5 transition-transform duration-150',
                        isOpen ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  </button>
                )}
                {isOpen && (
                  <div className="space-y-1">
                    {section.items.map(({ to, label, icon: Icon, end }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={end as any}
                        className={({ isActive }: { isActive: boolean }) =>
                          clsx(
                            'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                            isActive
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          )
                        }
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
            <div className="h-10 mb-2 flex items-center justify-between">
              <div className="text-base font-semibold">School Admin</div>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close sidebar">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
              {visibleSections.map((section, idx) => {
                const isRootSection = !section.label;
                const sectionKey = section.label || `section-${idx}`;
                const isOpen = isRootSection || openSection === sectionKey;

                return (
                  <div key={idx} className="space-y-1">
                    {section.label && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSection((prev) => (prev === sectionKey ? null : sectionKey))
                        }
                        className="w-full flex items-center justify-between px-3 py-1.5 uppercase tracking-wide text-[0.68rem] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <span>{section.label}</span>
                        <ChevronDownIcon
                          className={clsx(
                            'h-3.5 w-3.5 transition-transform duration-150',
                            isOpen ? 'rotate-0' : '-rotate-90'
                          )}
                        />
                      </button>
                    )}
                    {isOpen && (
                      <div className="space-y-1">
                        {section.items.map(({ to, label, icon: Icon, end }) => (
                          <NavLink
                            key={to}
                            to={to}
                            end={end as any}
                            onClick={onClose}
                            className={({ isActive }: { isActive: boolean }) =>
                              clsx(
                                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                                isActive
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                              )
                            }
                          >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                            <span>{label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
