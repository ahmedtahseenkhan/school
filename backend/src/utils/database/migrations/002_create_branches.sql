CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES school(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  type VARCHAR(20) CHECK (type IN ('main','branch')) NOT NULL DEFAULT 'branch',
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  principal_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_branches_school_id ON branches(school_id);
