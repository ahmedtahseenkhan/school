import React from 'react';
import PermissionGuard from '@/components/auth/PermissionGuard.jsx';
import { Route } from 'react-router-dom';

import EmployeeList from './pages/employees/EmployeeList.jsx';
import EmployeeForm from './pages/employees/EmployeeForm.jsx';
import EmployeeProfile from './pages/employees/EmployeeProfile.jsx';
import EmployeeTransferRequests from './pages/employees/EmployeeTransferRequests.jsx';

import DepartmentsPage from './pages/masters/Departments.jsx';
import DesignationsPage from './pages/masters/Designations.jsx';
import ShiftsPage from './pages/masters/Shifts.jsx';
import LeaveTypesPage from './pages/masters/LeaveTypes.jsx';
import SalaryComponentsPage from './pages/masters/SalaryComponents.jsx';

import AttendanceMarking from './pages/attendance/AttendanceMarking.jsx';
import AttendanceReport from './pages/attendance/AttendanceReport.jsx';
import AttendanceCalendar from './pages/attendance/AttendanceCalendar.jsx';
import RegularizationRequests from './pages/attendance/RegularizationRequests.jsx';
import EmployeeAttendance from './pages/attendance/EmployeeAttendance.jsx';
import HolidayTypesPage from './pages/attendance/HolidayTypes.jsx';
import CalendarHolidaysPage from './pages/attendance/CalendarHolidays.jsx';
import AttendancePoliciesPage from './pages/attendance/AttendancePolicies.jsx';
import AttendanceDevicesPage from './pages/attendance/AttendanceDevices.jsx';
import TimeAttendanceMenu from './pages/attendance/TimeAttendanceMenu.jsx';

import LeaveApplication from './pages/leave/LeaveApplication.jsx';
import LeaveBalance from './pages/leave/LeaveBalance.jsx';
import LeaveCalendar from './pages/leave/LeaveCalendar.jsx';
import LeaveApproval from './pages/leave/LeaveApproval.jsx';
import LeaveQuotaAllocation from './pages/leave/LeaveQuotaAllocation.jsx';
import LeaveAdjustment from './pages/leave/LeaveAdjustment.jsx';

import PayrollProcessing from './pages/payroll/PayrollProcessing.jsx';
import SalaryStructure from './pages/payroll/SalaryStructure.jsx';
import PayslipGenerator from './pages/payroll/PayslipGenerator.jsx';
import LoanManagement from './pages/payroll/LoanManagement.jsx';
import PayrollPeriods from './pages/payroll/PayrollPeriods.jsx';
import PayrollRegister from './pages/payroll/PayrollRegister.jsx';
import PayrollSummary from './pages/payroll/PayrollSummary.jsx';
import LoanReports from './pages/payroll/LoanReports.jsx';
import TaxDeductionReports from './pages/payroll/TaxDeductionReports.jsx';
import RecurringDeductions from './pages/payroll/RecurringDeductions.jsx';
import PayrollAuditLog from './pages/payroll/PayrollAuditLog.jsx';

import GoalSetting from './pages/performance/GoalSetting.jsx';
import AppraisalCycles from './pages/performance/AppraisalCycles.jsx';
import PerformanceReview from './pages/performance/PerformanceReview.jsx';
import TrainingManagement from './pages/performance/TrainingManagement.jsx';

import JobPostings from './pages/recruitment/JobPostings.jsx';
import ApplicantTracking from './pages/recruitment/ApplicantTracking.jsx';
import InterviewScheduling from './pages/recruitment/InterviewScheduling.jsx';
import OnboardingChecklist from './pages/recruitment/OnboardingChecklist.jsx';

export const HRRoutes = (
  <>
    {/* Employees */}
    <Route path="hr/employees" element={<PermissionGuard anyOf={["hr.employee:read","module:hr:access","*:manage"]}><EmployeeList /></PermissionGuard>} />
    <Route path="hr/employees/new" element={<PermissionGuard anyOf={["hr.employee:create","*:manage"]}><EmployeeForm /></PermissionGuard>} />
    <Route path="hr/employees/:id" element={<PermissionGuard anyOf={["hr.employee:read","*:manage"]}><EmployeeProfile /></PermissionGuard>} />
    <Route path="hr/employees/transfers" element={<PermissionGuard anyOf={["hr.employee:read","hr.employee:update","*:manage"]}><EmployeeTransferRequests /></PermissionGuard>} />

    {/* Masters */}
    <Route path="hr/masters/departments" element={<PermissionGuard anyOf={["hr.department:read","*:manage"]}><DepartmentsPage /></PermissionGuard>} />
    <Route path="hr/masters/designations" element={<PermissionGuard anyOf={["hr.designation:read","*:manage"]}><DesignationsPage /></PermissionGuard>} />
    <Route path="hr/masters/shifts" element={<PermissionGuard anyOf={["hr.shift:read","*:manage"]}><ShiftsPage /></PermissionGuard>} />
    <Route path="hr/masters/leave-types" element={<PermissionGuard anyOf={["hr.leave_type:read","*:manage"]}><LeaveTypesPage /></PermissionGuard>} />
    <Route path="hr/masters/salary-components" element={<PermissionGuard anyOf={["hr.salary_component:read","*:manage"]}><SalaryComponentsPage /></PermissionGuard>} />

    {/* Attendance */}
    <Route path="hr/time-attendance" element={<PermissionGuard anyOf={["module:hr:access","hr.attendance:report","*:manage"]}><TimeAttendanceMenu /></PermissionGuard>} />
    <Route path="hr/attendance/holiday-types" element={<PermissionGuard anyOf={["hr.holiday_type:read","*:manage"]}><HolidayTypesPage /></PermissionGuard>} />
    <Route path="hr/attendance/calendar-holidays" element={<PermissionGuard anyOf={["hr.calendar_holiday:read","*:manage"]}><CalendarHolidaysPage /></PermissionGuard>} />
    <Route path="hr/attendance/policies" element={<PermissionGuard anyOf={["hr.attendance_policy:read","*:manage"]}><AttendancePoliciesPage /></PermissionGuard>} />
    <Route path="hr/attendance/devices" element={<PermissionGuard anyOf={["hr.attendance_device:read","*:manage"]}><AttendanceDevicesPage /></PermissionGuard>} />
    <Route path="hr/attendance/marking" element={<PermissionGuard anyOf={["hr.attendance:mark","*:manage"]}><AttendanceMarking /></PermissionGuard>} />
    <Route path="hr/attendance/report" element={<PermissionGuard anyOf={["hr.attendance:report","*:manage"]}><AttendanceReport /></PermissionGuard>} />
    <Route path="hr/attendance/employee" element={<PermissionGuard anyOf={["hr.attendance:report","hr.attendance:mark","*:manage"]}><EmployeeAttendance /></PermissionGuard>} />
    <Route path="hr/attendance/calendar" element={<PermissionGuard anyOf={["hr.attendance:report","*:manage"]}><AttendanceCalendar /></PermissionGuard>} />
    <Route path="hr/attendance/regularization" element={<PermissionGuard anyOf={["hr.attendance:regularize","*:manage"]}><RegularizationRequests /></PermissionGuard>} />

    {/* Leave */}
    <Route path="hr/leave/apply" element={<PermissionGuard anyOf={["hr.leave:apply","*:manage"]}><LeaveApplication /></PermissionGuard>} />
    <Route path="hr/leave/balance" element={<PermissionGuard anyOf={["hr.leave:read","*:manage"]}><LeaveBalance /></PermissionGuard>} />
    <Route path="hr/leave/calendar" element={<PermissionGuard anyOf={["hr.leave:read","*:manage"]}><LeaveCalendar /></PermissionGuard>} />
    <Route path="hr/leave/approval" element={<PermissionGuard anyOf={["hr.leave:approve","*:manage"]}><LeaveApproval /></PermissionGuard>} />
    <Route path="hr/leave/quotas" element={<PermissionGuard anyOf={["hr.leave_quota:read","*:manage"]}><LeaveQuotaAllocation /></PermissionGuard>} />
    <Route path="hr/leave/adjustments" element={<PermissionGuard anyOf={["hr.leave:read","*:manage"]}><LeaveAdjustment /></PermissionGuard>} />

    {/* Payroll */}
    <Route path="hr/payroll/processing" element={<PermissionGuard anyOf={["hr.payroll:process","*:manage"]}><PayrollProcessing /></PermissionGuard>} />
    <Route path="hr/payroll/salary-structure" element={<PermissionGuard anyOf={["hr.salary_structure:read","*:manage"]}><SalaryStructure /></PermissionGuard>} />
    <Route path="hr/payroll/summary" element={<PermissionGuard anyOf={["hr.payroll:read","*:manage"]}><PayrollSummary /></PermissionGuard>} />
    <Route path="hr/payroll/periods" element={<PermissionGuard anyOf={["hr.payroll:read","*:manage"]}><PayrollPeriods /></PermissionGuard>} />
    <Route path="hr/payroll/register" element={<PermissionGuard anyOf={["hr.payroll:read","*:manage"]}><PayrollRegister /></PermissionGuard>} />
    <Route path="hr/payroll/payslips" element={<PermissionGuard anyOf={["hr.payroll:read","*:manage"]}><PayslipGenerator /></PermissionGuard>} />
    <Route path="hr/payroll/loans" element={<PermissionGuard anyOf={["hr.loan:read","*:manage"]}><LoanManagement /></PermissionGuard>} />
    <Route path="hr/payroll/loan-reports" element={<PermissionGuard anyOf={["hr.loan:read","*:manage"]}><LoanReports /></PermissionGuard>} />
    <Route path="hr/payroll/tax-deductions" element={<PermissionGuard anyOf={["hr.payroll:read","*:manage"]}><TaxDeductionReports /></PermissionGuard>} />
    <Route path="hr/payroll/recurring-deductions" element={<PermissionGuard anyOf={["hr.payroll:read","hr.payroll:process","*:manage"]}><RecurringDeductions /></PermissionGuard>} />
    <Route path="hr/payroll/audit-log" element={<PermissionGuard anyOf={["hr.payroll:read","*:manage"]}><PayrollAuditLog /></PermissionGuard>} />

    {/* Performance */}
    <Route path="hr/performance/goals" element={<PermissionGuard anyOf={["hr.performance:read","*:manage"]}><GoalSetting /></PermissionGuard>} />
    <Route path="hr/performance/appraisals" element={<PermissionGuard anyOf={["hr.performance:read","*:manage"]}><AppraisalCycles /></PermissionGuard>} />
    <Route path="hr/performance/reviews" element={<PermissionGuard anyOf={["hr.performance:read","*:manage"]}><PerformanceReview /></PermissionGuard>} />
    <Route path="hr/performance/training" element={<PermissionGuard anyOf={["hr.training:read","*:manage"]}><TrainingManagement /></PermissionGuard>} />

    {/* Recruitment */}
    <Route path="hr/recruitment/job-postings" element={<PermissionGuard anyOf={["hr.job_posting:read","*:manage"]}><JobPostings /></PermissionGuard>} />
    <Route path="hr/recruitment/applicants" element={<PermissionGuard anyOf={["hr.applicant:read","*:manage"]}><ApplicantTracking /></PermissionGuard>} />
    <Route path="hr/recruitment/interviews" element={<PermissionGuard anyOf={["hr.interview:read","*:manage"]}><InterviewScheduling /></PermissionGuard>} />
    <Route path="hr/recruitment/onboarding" element={<PermissionGuard anyOf={["hr.employee_onboarding:read","*:manage"]}><OnboardingChecklist /></PermissionGuard>} />
  </>
);
