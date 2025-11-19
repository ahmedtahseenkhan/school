BEGIN;

CREATE TABLE IF NOT EXISTS calendar_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL, -- Calendar Holiday name
  payroll_register VARCHAR(150),
  payroll_period VARCHAR(150),
  apply_on VARCHAR(100), -- e.g. Department, Branch, All
  year INTEGER,
  period_label VARCHAR(100),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
