-- HR Module Schema Migration
-- Order: base lookup tables -> employees -> dependent tables -> FKs that would otherwise be circular

BEGIN;

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  head_employee_id UUID, -- FK added after employees table
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Designations
CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  hierarchy_level INTEGER DEFAULT 0,
  grade VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  department_id UUID REFERENCES departments(id),
  designation_id UUID REFERENCES designations(id),

  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  blood_group VARCHAR(10),
  national_id VARCHAR(50),

  personal_email VARCHAR(255),
  personal_phone VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),

  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),

  employment_type VARCHAR(50) CHECK (employment_type IN ('full_time','part_time','contract','temporary')),
  joining_date DATE NOT NULL,
  confirmation_date DATE,
  termination_date DATE,
  employment_status VARCHAR(50) DEFAULT 'active' CHECK (employment_status IN ('active','probation','inactive','terminated','resigned')),

  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_ifsc_code VARCHAR(20),

  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add back reference now to avoid circular dependency
ALTER TABLE departments
  ADD CONSTRAINT fk_departments_head_employee
  FOREIGN KEY (head_employee_id) REFERENCES employees(id);

-- Employee Qualifications
CREATE TABLE IF NOT EXISTS employee_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  qualification_type VARCHAR(100) NOT NULL,
  qualification_name VARCHAR(200) NOT NULL,
  institution VARCHAR(200),
  year_of_passing INTEGER,
  percentage DECIMAL(5,2),
  document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Skills
CREATE TABLE IF NOT EXISTS employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  skill_type VARCHAR(100) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_rating INTEGER CHECK (skill_rating >= 1 AND skill_rating <= 5),
  proficiency_level VARCHAR(50),
  years_of_experience INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employment History
CREATE TABLE IF NOT EXISTS employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  company_name VARCHAR(200) NOT NULL,
  position VARCHAR(100),
  start_date DATE,
  end_date DATE,
  responsibilities TEXT,
  reference_contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  title VARCHAR(200) NOT NULL,
  department_id UUID REFERENCES departments(id),
  designation_id UUID REFERENCES designations(id),
  employment_type VARCHAR(50),
  vacancies INTEGER DEFAULT 1,
  job_description TEXT,
  requirements TEXT,
  experience_required VARCHAR(100),
  salary_range VARCHAR(100),
  application_deadline DATE,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','closed','draft')),
  posted_by UUID REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Applicants
CREATE TABLE IF NOT EXISTS job_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  resume_url VARCHAR(500),
  cover_letter TEXT,
  current_company VARCHAR(200),
  current_position VARCHAR(100),
  total_experience DECIMAL(4,2),
  current_salary DECIMAL(10,2),
  expected_salary DECIMAL(10,2),
  application_status VARCHAR(50) DEFAULT 'applied' CHECK (application_status IN ('applied','screening','interview','rejected','hired')),
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Rounds
CREATE TABLE IF NOT EXISTS interview_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES job_applicants(id),
  round_number INTEGER NOT NULL,
  round_name VARCHAR(100),
  interviewer_id UUID REFERENCES employees(id),
  scheduled_date TIMESTAMP,
  actual_date TIMESTAMP,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding Templates & Tasks
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  for_designation_id UUID REFERENCES designations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES onboarding_templates(id),
  task_name VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to_role VARCHAR(50),
  deadline_days INTEGER,
  is_mandatory BOOLEAN DEFAULT true,
  task_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  task_id UUID NOT NULL REFERENCES onboarding_tasks(id),
  assigned_to UUID REFERENCES employees(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','overdue')),
  completed_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Devices & Records
CREATE TABLE IF NOT EXISTS attendance_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  device_name VARCHAR(100) NOT NULL,
  device_id VARCHAR(100) UNIQUE NOT NULL,
  device_type VARCHAR(50),
  location VARCHAR(200),
  ip_address VARCHAR(45),
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  attendance_date DATE NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  device_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'present' CHECK (status IN ('present','absent','half_day','late','holiday')),
  worked_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS attendance_regularization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  attendance_date DATE NOT NULL,
  requested_check_in TIMESTAMP,
  requested_check_out TIMESTAMP,
  reason TEXT,
  supporting_document_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  max_days_per_year INTEGER,
  carry_forward_days INTEGER DEFAULT 0,
  requires_medical_certificate BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  total_days INTEGER DEFAULT 0,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER DEFAULT 0,
  carried_forward_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  medical_certificate_url VARCHAR(500),
  contact_during_leave VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  effective_date DATE NOT NULL,
  end_date DATE,
  assigned_by UUID REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payroll
CREATE TABLE IF NOT EXISTS salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('earning','deduction')),
  calculation_type VARCHAR(50) CHECK (calculation_type IN ('fixed','percentage','variable')),
  is_taxable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_salary_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  component_id UUID NOT NULL REFERENCES salary_components(id),
  amount DECIMAL(10,2) NOT NULL,
  percentage_base UUID REFERENCES salary_components(id),
  effective_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  period_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','processing','completed','locked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  basic_salary DECIMAL(10,2),
  gross_earnings DECIMAL(10,2),
  total_deductions DECIMAL(10,2),
  net_salary DECIMAL(10,2),
  working_days INTEGER,
  present_days INTEGER,
  leave_days INTEGER,
  overtime_hours DECIMAL(5,2),
  overtime_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_record_id UUID NOT NULL REFERENCES payroll_records(id),
  component_id UUID NOT NULL REFERENCES salary_components(id),
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans & Advances
CREATE TABLE IF NOT EXISTS employee_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  loan_type VARCHAR(100) NOT NULL,
  loan_amount DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  tenure_months INTEGER NOT NULL,
  start_date DATE NOT NULL,
  emi_amount DECIMAL(10,2),
  remaining_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','closed','defaulted')),
  approved_by UUID REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES employee_loans(id),
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  principal_amount DECIMAL(10,2),
  interest_amount DECIMAL(10,2),
  remaining_balance DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reimbursements
CREATE TABLE IF NOT EXISTS reimbursement_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  claim_type VARCHAR(100) NOT NULL,
  claim_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  document_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMP,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance
CREATE TABLE IF NOT EXISTS performance_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  weightage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  goal_title VARCHAR(200) NOT NULL,
  goal_description TEXT,
  goal_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  target_value VARCHAR(100),
  achieved_value VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','achieved','cancelled','extended')),
  progress_percentage INTEGER DEFAULT 0,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appraisal_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  evaluation_period_start DATE,
  evaluation_period_end DATE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','active','completed','cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_cycle_id UUID NOT NULL REFERENCES appraisal_cycles(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  reviewer_id UUID NOT NULL REFERENCES employees(id),
  review_date DATE,
  overall_rating DECIMAL(3,1),
  strengths TEXT,
  improvement_areas TEXT,
  recommendations TEXT,
  employee_comments TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES performance_reviews(id),
  kpi_id UUID REFERENCES performance_kpis(id),
  kpi_name VARCHAR(200) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  weightage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 360 Feedback
CREATE TABLE IF NOT EXISTS feedback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  feedback_provider_id UUID NOT NULL REFERENCES employees(id),
  relationship_type VARCHAR(50) CHECK (relationship_type IN ('manager','peer','subordinate','self')),
  requested_date DATE,
  completed_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','completed','overdue')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_request_id UUID NOT NULL REFERENCES feedback_requests(id),
  question TEXT NOT NULL,
  response TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training & Development
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  trainer_name VARCHAR(100),
  training_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  duration_hours INTEGER,
  max_participants INTEGER,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID NOT NULL REFERENCES training_programs(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  attendance_status VARCHAR(50) DEFAULT 'registered',
  pre_training_rating INTEGER,
  post_training_rating INTEGER,
  feedback TEXT,
  certificate_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
