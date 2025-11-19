BEGIN;

CREATE TABLE IF NOT EXISTS employee_recurring_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  component_id UUID NOT NULL REFERENCES salary_components(id),
  amount DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  frequency VARCHAR(50) DEFAULT 'monthly',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
