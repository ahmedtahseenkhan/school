BEGIN;

CREATE TABLE IF NOT EXISTS attendance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  policy_type VARCHAR(100) NOT NULL, -- e.g. Late Arrival Policy, Absent Policy, Early Departure Policy
  calculate_on VARCHAR(100), -- e.g. Working days, Calendar days, etc.
  apply_on_off_days BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
