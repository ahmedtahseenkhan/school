BEGIN;

-- Add new employee fields to store selected lookup codes
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_shift VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS grade_band VARCHAR(50);

COMMIT;
