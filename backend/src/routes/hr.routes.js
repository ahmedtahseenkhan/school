const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { attachBranchContext } = require('../middleware/branch.middleware');
const emp = require('../modules/hr/controllers/employee.controller');
const att = require('../modules/hr/controllers/attendance.controller');
const lev = require('../modules/hr/controllers/leave.controller');
const pay = require('../modules/hr/controllers/payroll.controller');
const mst = require('../modules/hr/controllers/masters.controller');
const rec = require('../modules/hr/controllers/recruitment.controller');
const str = require('../modules/hr/controllers/structures.controller');
const onb = require('../modules/hr/controllers/onboarding.controller');
const fin = require('../modules/hr/controllers/finance.controller');
const dev = require('../modules/hr/controllers/devices.controller');
const shf = require('../modules/hr/controllers/shift_assignments.controller');
const trn = require('../modules/hr/controllers/training.controller');

const router = express.Router();

router.use(authenticate, attachBranchContext, requirePermission('module:hr:access'));

router.get('/employees', requirePermission('hr.employee:read'), emp.getEmployees);
router.post('/employees', requirePermission('hr.employee:create'), emp.createEmployee);
router.get('/employees/:id', requirePermission('hr.employee:read'), emp.getEmployeeProfile);
router.put('/employees/:id', requirePermission('hr.employee:update'), emp.updateEmployee);
router.delete('/employees/:id', requirePermission('hr.employee:delete'), emp.deleteEmployee);
router.post('/employees/:id/photo', emp.uploadEmployeePhoto);

router.get('/employee-transfers', requirePermission('hr.employee:read'), emp.listTransfers);
router.post('/employee-transfers', requirePermission('hr.employee:update'), emp.createTransfer);
router.put('/employee-transfers/:id', requirePermission('hr.employee:update'), emp.updateTransfer);

// Employee sub-resources
router.get('/employees/:id/emergency-contacts', requirePermission('hr.employee:read'), emp.listEmergencyContacts);
router.post('/employees/:id/emergency-contacts', requirePermission('hr.employee:update'), emp.createEmergencyContact);
router.put('/employees/:id/emergency-contacts/:contactId', requirePermission('hr.employee:update'), emp.updateEmergencyContact);
router.delete('/employees/:id/emergency-contacts/:contactId', requirePermission('hr.employee:update'), emp.deleteEmergencyContact);

router.get('/employees/:id/qualifications', requirePermission('hr.employee:read'), emp.listQualifications);
router.post('/employees/:id/qualifications', requirePermission('hr.employee:update'), emp.createQualification);
router.put('/employees/:id/qualifications/:qualId', requirePermission('hr.employee:update'), emp.updateQualification);
router.delete('/employees/:id/qualifications/:qualId', requirePermission('hr.employee:update'), emp.deleteQualification);

router.get('/employees/:id/skills', requirePermission('hr.employee:read'), emp.listSkills);
router.post('/employees/:id/skills', requirePermission('hr.employee:update'), emp.createSkill);
router.put('/employees/:id/skills/:skillId', requirePermission('hr.employee:update'), emp.updateSkill);
router.delete('/employees/:id/skills/:skillId', requirePermission('hr.employee:update'), emp.deleteSkill);

router.get('/employees/:id/documents', requirePermission('hr.employee:read'), emp.listDocuments);
router.post('/employees/:id/documents', requirePermission('hr.employee:update'), emp.createDocument);
router.put('/employees/:id/documents/:docId', requirePermission('hr.employee:update'), emp.updateDocument);
router.delete('/employees/:id/documents/:docId', requirePermission('hr.employee:update'), emp.deleteDocument);

router.get('/employees/:id/employment-history', requirePermission('hr.employee:read'), emp.listEmploymentHistory);
router.post('/employees/:id/employment-history', requirePermission('hr.employee:update'), emp.createEmploymentHistory);
router.put('/employees/:id/employment-history/:histId', requirePermission('hr.employee:update'), emp.updateEmploymentHistory);
router.delete('/employees/:id/employment-history/:histId', requirePermission('hr.employee:update'), emp.deleteEmploymentHistory);

router.post('/attendance/mark', requirePermission('hr.attendance:mark'), att.markAttendance);
router.get('/attendance/report', requirePermission('hr.attendance:report'), att.getAttendanceReport);
router.post('/attendance/regularize', requirePermission('hr.attendance:regularize'), att.regularizeAttendance);
router.get('/attendance/regularization', requirePermission('hr.attendance:regularize'), att.listRegularization);
router.post('/attendance/regularization/:id/approve', requirePermission('hr.attendance:regularize'), att.approveRegularization);
router.post('/attendance/bulk', requirePermission('hr.attendance:mark'), att.uploadBulkAttendance);

router.post('/leave/apply', requirePermission('hr.leave:apply'), lev.applyLeave);
router.get('/leave/applications', requirePermission('hr.leave:read'), lev.getLeaveApplications);
router.post('/leave/applications/:id/approve', requirePermission('hr.leave:approve'), lev.approveLeave);
router.get('/leave/balance', requirePermission('hr.leave:read'), lev.getLeaveBalance);
router.get('/leave/adjustments', requirePermission('hr.leave:read'), lev.listLeaveAdjustments);
router.post('/leave/adjustments', requirePermission('hr.leave:apply'), lev.createLeaveAdjustment);

router.post('/payroll/process', requirePermission('hr.payroll:process'), pay.processPayroll);
router.get('/payroll/:employeeId/payslip', requirePermission('hr.payroll:read'), pay.getPayslip);
router.get('/payroll/report', requirePermission('hr.payroll:read'), pay.getPayrollReport);
router.get('/payroll/tax-report', requirePermission('hr.payroll:read'), pay.getTaxDeductionReport);
router.get('/payroll/periods', requirePermission('hr.payroll:read'), pay.listPayrollPeriods);
router.get('/payroll/periods/:id', requirePermission('hr.payroll:read'), pay.getPayrollPeriod);
router.put('/payroll/periods/:id', requirePermission('hr.payroll:process'), pay.updatePayrollPeriod);
router.get('/payroll/periods/:id/register', requirePermission('hr.payroll:read'), pay.getPayrollRegister);

router.get('/departments', requirePermission('hr.department:read'), mst.listDepartments);
router.post('/departments', requirePermission('hr.department:create'), mst.createDepartment);
router.put('/departments/:id', requirePermission('hr.department:update'), mst.updateDepartment);
router.delete('/departments/:id', requirePermission('hr.department:delete'), mst.deleteDepartment);

router.get('/designations', requirePermission('hr.designation:read'), mst.listDesignations);
router.post('/designations', requirePermission('hr.designation:create'), mst.createDesignation);
router.put('/designations/:id', requirePermission('hr.designation:update'), mst.updateDesignation);
router.delete('/designations/:id', requirePermission('hr.designation:delete'), mst.deleteDesignation);

router.get('/leave-types', requirePermission('hr.leave_type:read'), mst.listLeaveTypes);
router.post('/leave-types', requirePermission('hr.leave_type:create'), mst.createLeaveType);
router.put('/leave-types/:id', requirePermission('hr.leave_type:update'), mst.updateLeaveType);
router.delete('/leave-types/:id', requirePermission('hr.leave_type:delete'), mst.deleteLeaveType);

router.get('/holiday-types', requirePermission('hr.holiday_type:read'), mst.listHolidayTypes);
router.post('/holiday-types', requirePermission('hr.holiday_type:create'), mst.createHolidayType);
router.put('/holiday-types/:id', requirePermission('hr.holiday_type:update'), mst.updateHolidayType);
router.delete('/holiday-types/:id', requirePermission('hr.holiday_type:delete'), mst.deleteHolidayType);

router.get('/calendar-holidays', requirePermission('hr.calendar_holiday:read'), mst.listCalendarHolidays);
router.post('/calendar-holidays', requirePermission('hr.calendar_holiday:create'), mst.createCalendarHoliday);
router.put('/calendar-holidays/:id', requirePermission('hr.calendar_holiday:update'), mst.updateCalendarHoliday);
router.delete('/calendar-holidays/:id', requirePermission('hr.calendar_holiday:delete'), mst.deleteCalendarHoliday);

router.get('/attendance-policies', requirePermission('hr.attendance_policy:read'), mst.listAttendancePolicies);
router.post('/attendance-policies', requirePermission('hr.attendance_policy:create'), mst.createAttendancePolicy);
router.put('/attendance-policies/:id', requirePermission('hr.attendance_policy:update'), mst.updateAttendancePolicy);
router.delete('/attendance-policies/:id', requirePermission('hr.attendance_policy:delete'), mst.deleteAttendancePolicy);

router.get('/shifts', requirePermission('hr.shift:read'), mst.listShifts);
router.post('/shifts', requirePermission('hr.shift:create'), mst.createShift);
router.put('/shifts/:id', requirePermission('hr.shift:update'), mst.updateShift);
router.delete('/shifts/:id', requirePermission('hr.shift:delete'), mst.deleteShift);

router.get('/salary-components', requirePermission('hr.salary_component:read'), mst.listSalaryComponents);
router.post('/salary-components', requirePermission('hr.salary_component:create'), mst.createSalaryComponent);
router.put('/salary-components/:id', requirePermission('hr.salary_component:update'), mst.updateSalaryComponent);
router.delete('/salary-components/:id', requirePermission('hr.salary_component:delete'), mst.deleteSalaryComponent);

router.get('/job-postings', requirePermission('hr.job_posting:read'), mst.listJobPostings);
router.post('/job-postings', requirePermission('hr.job_posting:create'), mst.createJobPosting);
router.put('/job-postings/:id', requirePermission('hr.job_posting:update'), mst.updateJobPosting);
router.delete('/job-postings/:id', requirePermission('hr.job_posting:delete'), mst.deleteJobPosting);

// Dynamic Lookups
router.get('/lookups/:category', requirePermission('hr.lookup:read'), mst.listLookups);
router.post('/lookups/:category', requirePermission('hr.lookup:create'), mst.createLookup);
router.put('/lookups/:category/:id', requirePermission('hr.lookup:update'), mst.updateLookup);
router.delete('/lookups/:category/:id', requirePermission('hr.lookup:delete'), mst.deleteLookup);

// Recruitment
router.get('/applicants', requirePermission('hr.applicant:read'), rec.listApplicants);
router.post('/applicants', requirePermission('hr.applicant:create'), rec.createApplicant);
router.put('/applicants/:id', requirePermission('hr.applicant:update'), rec.updateApplicant);
router.delete('/applicants/:id', requirePermission('hr.applicant:delete'), rec.deleteApplicant);

router.get('/interviews', requirePermission('hr.interview:read'), rec.listInterviews);
router.post('/interviews', requirePermission('hr.interview:create'), rec.createInterview);
router.put('/interviews/:id', requirePermission('hr.interview:update'), rec.updateInterview);
router.delete('/interviews/:id', requirePermission('hr.interview:delete'), rec.deleteInterview);

// Onboarding
router.get('/onboarding/templates', requirePermission('hr.onboarding_template:read'), onb.listTemplates);
router.post('/onboarding/templates', requirePermission('hr.onboarding_template:create'), onb.createTemplate);
router.put('/onboarding/templates/:id', requirePermission('hr.onboarding_template:update'), onb.updateTemplate);
router.delete('/onboarding/templates/:id', requirePermission('hr.onboarding_template:delete'), onb.deleteTemplate);

router.get('/onboarding/tasks', requirePermission('hr.onboarding_task:read'), onb.listTasks);
router.post('/onboarding/tasks', requirePermission('hr.onboarding_task:create'), onb.createTask);
router.put('/onboarding/tasks/:id', requirePermission('hr.onboarding_task:update'), onb.updateTask);
router.delete('/onboarding/tasks/:id', requirePermission('hr.onboarding_task:delete'), onb.deleteTask);

router.get('/onboarding/employee', requirePermission('hr.employee_onboarding:read'), onb.listEmployeeOnboarding);
router.post('/onboarding/employee', requirePermission('hr.employee_onboarding:create'), onb.createEmployeeOnboarding);
router.put('/onboarding/employee/:id', requirePermission('hr.employee_onboarding:update'), onb.updateEmployeeOnboarding);
router.delete('/onboarding/employee/:id', requirePermission('hr.employee_onboarding:delete'), onb.deleteEmployeeOnboarding);

// Finance
router.get('/loans', requirePermission('hr.loan:read'), fin.listLoans);
router.post('/loans', requirePermission('hr.loan:create'), fin.createLoan);
router.put('/loans/:id', requirePermission('hr.loan:update'), fin.updateLoan);
router.delete('/loans/:id', requirePermission('hr.loan:delete'), fin.deleteLoan);

router.get('/loan-repayments', requirePermission('hr.loan_repayment:read'), fin.listRepayments);
router.post('/loan-repayments', requirePermission('hr.loan_repayment:create'), fin.createRepayment);
router.put('/loan-repayments/:id', requirePermission('hr.loan_repayment:update'), fin.updateRepayment);
router.delete('/loan-repayments/:id', requirePermission('hr.loan_repayment:delete'), fin.deleteRepayment);

router.get('/reimbursements', requirePermission('hr.reimbursement:read'), fin.listReimbursements);
router.post('/reimbursements', requirePermission('hr.reimbursement:create'), fin.createReimbursement);
router.put('/reimbursements/:id', requirePermission('hr.reimbursement:update'), fin.updateReimbursement);
router.delete('/reimbursements/:id', requirePermission('hr.reimbursement:delete'), fin.deleteReimbursement);

// Structures
router.get('/leave-quotas', requirePermission('hr.leave_quota:read'), str.listLeaveQuotas);
router.post('/leave-quotas', requirePermission('hr.leave_quota:create'), str.createLeaveQuota);
router.put('/leave-quotas/:id', requirePermission('hr.leave_quota:update'), str.updateLeaveQuota);
router.delete('/leave-quotas/:id', requirePermission('hr.leave_quota:delete'), str.deleteLeaveQuota);

router.get('/salary-structure', requirePermission('hr.salary_structure:read'), str.listSalaryStructure);
router.post('/salary-structure', requirePermission('hr.salary_structure:create'), str.createSalaryStructure);
router.put('/salary-structure/:id', requirePermission('hr.salary_structure:update'), str.updateSalaryStructure);
router.delete('/salary-structure/:id', requirePermission('hr.salary_structure:delete'), str.deleteSalaryStructure);

router.get('/recurring-deductions', requirePermission('hr.payroll:read'), str.listRecurringDeductions);
router.post('/recurring-deductions', requirePermission('hr.payroll:process'), str.createRecurringDeduction);
router.put('/recurring-deductions/:id', requirePermission('hr.payroll:process'), str.updateRecurringDeduction);
router.delete('/recurring-deductions/:id', requirePermission('hr.payroll:process'), str.deleteRecurringDeduction);

router.get('/audit-log', requirePermission('hr.payroll:read'), str.listAuditLog);

// Devices & Shift Assignments
router.get('/attendance-devices', requirePermission('hr.attendance_device:read'), dev.listDevices);
router.post('/attendance-devices', requirePermission('hr.attendance_device:create'), dev.createDevice);
router.put('/attendance-devices/:id', requirePermission('hr.attendance_device:update'), dev.updateDevice);
router.delete('/attendance-devices/:id', requirePermission('hr.attendance_device:delete'), dev.deleteDevice);

router.get('/employee-shifts', requirePermission('hr.employee_shift:read'), shf.listAssignments);
router.post('/employee-shifts', requirePermission('hr.employee_shift:create'), shf.createAssignment);
router.put('/employee-shifts/:id', requirePermission('hr.employee_shift:update'), shf.updateAssignment);
router.delete('/employee-shifts/:id', requirePermission('hr.employee_shift:delete'), shf.deleteAssignment);

// Training
router.get('/training/programs', requirePermission('hr.training:read'), trn.listPrograms);
router.post('/training/programs', requirePermission('hr.training:create'), trn.createProgram);
router.put('/training/programs/:id', requirePermission('hr.training:update'), trn.updateProgram);
router.delete('/training/programs/:id', requirePermission('hr.training:delete'), trn.deleteProgram);

router.get('/training/participants', requirePermission('hr.training:read'), trn.listParticipants);
router.post('/training/participants', requirePermission('hr.training:create'), trn.createParticipant);
router.put('/training/participants/:id', requirePermission('hr.training:update'), trn.updateParticipant);
router.delete('/training/participants/:id', requirePermission('hr.training:delete'), trn.deleteParticipant);
module.exports = router;
