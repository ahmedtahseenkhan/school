BEGIN;

-- Generic lookup table for dynamic dropdowns
CREATE TABLE IF NOT EXISTS lookup_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id),
  category VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  meta JSONB,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, category, code)
);

-- Expand employees table with additional fields
ALTER TABLE employees ADD COLUMN IF NOT EXISTS title VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS driving_license VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS reporting_manager_id UUID REFERENCES employees(id);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_category VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_end_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_email VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_phone VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_location VARCHAR(200);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS desk_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS probation_period_months INTEGER;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS level VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS cost_center VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_micr_code VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pf_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS uan_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS esi_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tax_deduction_section VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS declared_investments TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS payment_frequency VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_insurance_provider VARCHAR(200);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_insurance_number VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_insurance_expiry DATE;

-- Relax and update ENUM-like checks
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_employment_type_check;
ALTER TABLE employees ADD CONSTRAINT employees_employment_type_check CHECK (employment_type IN ('full_time','part_time','contract','temporary','intern'));

ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_employment_status_check;
ALTER TABLE employees ADD CONSTRAINT employees_employment_status_check CHECK (employment_status IN ('active','probation','inactive','terminated','resigned','suspended'));

-- Emergency contacts
CREATE TABLE IF NOT EXISTS employee_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extend qualifications
ALTER TABLE employee_qualifications ADD COLUMN IF NOT EXISTS board_university VARCHAR(200);
ALTER TABLE employee_qualifications ADD COLUMN IF NOT EXISTS grade VARCHAR(50);
ALTER TABLE employee_qualifications ADD COLUMN IF NOT EXISTS specialization VARCHAR(200);

-- Extend skills
ALTER TABLE employee_skills ADD COLUMN IF NOT EXISTS last_used DATE;
ALTER TABLE employee_skills ADD COLUMN IF NOT EXISTS certification TEXT;

-- Employee documents
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(200) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  description TEXT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
