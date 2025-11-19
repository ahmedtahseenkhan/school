-- Ensure roles exist for backfill
INSERT INTO roles (name, description)
SELECT x.name, x.description
FROM (VALUES
  ('super_admin','Full system access'),
  ('admin','School admin with full school access'),
  ('principal','Branch principal'),
  ('teacher','Teacher'),
  ('student','Student'),
  ('parent','Parent'),
  ('accountant','Accounting staff'),
  ('librarian','Library staff')
) AS x(name, description)
ON CONFLICT (name) DO NOTHING;

-- Add role_id to users (nullable for now)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Backfill role_id from existing enum column when possible
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE u.role_id IS NULL AND r.name = u.role::text;

-- Keep existing enum column for backwards compatibility
