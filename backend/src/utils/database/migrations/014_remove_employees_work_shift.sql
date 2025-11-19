BEGIN;

-- Remove obsolete work_shift column from employees (using dedicated shifts + employee_shifts instead)
ALTER TABLE employees DROP COLUMN IF EXISTS work_shift;

COMMIT;
