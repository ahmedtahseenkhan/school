BEGIN;

ALTER TABLE leave_types
  ADD COLUMN IF NOT EXISTS leave_unit VARCHAR(20), -- e.g. days, hours
  ADD COLUMN IF NOT EXISTS leaves_per_period INTEGER, -- base entitlement per period (typically per year)
  ADD COLUMN IF NOT EXISTS renew_on VARCHAR(100), -- e.g. Every calendar year
  ADD COLUMN IF NOT EXISTS max_avail_unit VARCHAR(20),
  ADD COLUMN IF NOT EXISTS max_avail INTEGER,
  ADD COLUMN IF NOT EXISTS encashment_allowed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marital_status_filter VARCHAR(50),
  ADD COLUMN IF NOT EXISTS gender_filter VARCHAR(20),
  ADD COLUMN IF NOT EXISTS entitle_on VARCHAR(100),
  ADD COLUMN IF NOT EXISTS accrual_unit VARCHAR(50),
  ADD COLUMN IF NOT EXISTS allow_in_probation BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quota_validate BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_leave BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS request_before_days INTEGER,
  ADD COLUMN IF NOT EXISTS request_unit VARCHAR(20),
  ADD COLUMN IF NOT EXISTS late_adjustable BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS include_holidays BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS early_dep_adjustable BOOLEAN DEFAULT false;

COMMIT;
