BEGIN;

CREATE TABLE IF NOT EXISTS leave_adjustment_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  adjustment_type VARCHAR(50) NOT NULL, -- e.g. attendance_policy
  based_on_attendance_policy_id UUID REFERENCES attendance_policies(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_adjustment_policy_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES leave_adjustment_policies(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  priority INTEGER DEFAULT 1,
  days INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
