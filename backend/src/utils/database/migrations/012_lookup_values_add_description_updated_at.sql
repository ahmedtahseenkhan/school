BEGIN;

-- Add description and updated_at columns to lookup_values if missing
ALTER TABLE lookup_values ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE lookup_values ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Optional: backfill updated_at with created_at where null
UPDATE lookup_values SET updated_at = COALESCE(updated_at, created_at);

COMMIT;
