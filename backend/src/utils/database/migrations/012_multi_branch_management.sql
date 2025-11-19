-- Expand branches table and add multi-branch management tables

-- Safely extend branches table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'subdomain'
  ) THEN
    ALTER TABLE branches ADD COLUMN subdomain VARCHAR(100);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'status'
  ) THEN
    ALTER TABLE branches ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'established_date'
  ) THEN
    ALTER TABLE branches ADD COLUMN established_date DATE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'address_line1'
  ) THEN
    ALTER TABLE branches ADD COLUMN address_line1 TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE branches ADD COLUMN address_line2 TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'city'
  ) THEN
    ALTER TABLE branches ADD COLUMN city VARCHAR(100);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'state'
  ) THEN
    ALTER TABLE branches ADD COLUMN state VARCHAR(100);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE branches ADD COLUMN postal_code VARCHAR(20);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'country'
  ) THEN
    ALTER TABLE branches ADD COLUMN country VARCHAR(100) DEFAULT 'Pakistan';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'website'
  ) THEN
    ALTER TABLE branches ADD COLUMN website VARCHAR(255);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE branches ADD COLUMN logo_url VARCHAR(500);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE branches ADD COLUMN banner_url VARCHAR(500);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'primary_color'
  ) THEN
    ALTER TABLE branches ADD COLUMN primary_color VARCHAR(7) DEFAULT '#3B82F6';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'secondary_color'
  ) THEN
    ALTER TABLE branches ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#10B981';
  END IF;
END $$;

-- Optional references kept nullable (tables may not exist yet)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'academic_calendar_id'
  ) THEN
    ALTER TABLE branches ADD COLUMN academic_calendar_id UUID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'fee_structure_id'
  ) THEN
    ALTER TABLE branches ADD COLUMN fee_structure_id UUID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'settings'
  ) THEN
    ALTER TABLE branches ADD COLUMN settings JSONB DEFAULT '{
      "allowStudentTransfer": true,
      "autoApproveAdmissions": false,
      "enableOnlinePayments": true,
      "smsNotifications": true,
      "emailNotifications": true,
      "attendanceAlerts": true
    }'::jsonb;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE branches ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'last_sync_at'
  ) THEN
    ALTER TABLE branches ADD COLUMN last_sync_at TIMESTAMP;
  END IF;
END $$;

-- Ensure unique constraints (skip if already present)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'branches_code_key'
  ) THEN
    BEGIN
      ALTER TABLE branches ADD CONSTRAINT branches_code_key UNIQUE (code);
    EXCEPTION WHEN duplicate_table THEN
      NULL;
    END;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'branches_subdomain_key'
  ) THEN
    BEGIN
      ALTER TABLE branches ADD CONSTRAINT branches_subdomain_key UNIQUE (subdomain);
    EXCEPTION WHEN duplicate_table THEN
      NULL;
    END;
  END IF;
END $$;

-- Relax/extend type check constraint: allow 'main','branch','campus','wing'
DO $$ DECLARE
  conname text;
  named_exists boolean;
BEGIN
  -- If our named constraint already exists, skip creation
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'branches' AND c.conname = 'branches_type_check'
  ) INTO named_exists;

  IF NOT named_exists THEN
    -- Drop any legacy anonymous type check constraint first
    SELECT c.conname INTO conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'branches' AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE '%type IN%';
    IF conname IS NOT NULL THEN
      EXECUTE format('ALTER TABLE branches DROP CONSTRAINT %I', conname);
    END IF;
    ALTER TABLE branches
      ADD CONSTRAINT branches_type_check CHECK (type IN ('main','branch','campus','wing'));
  END IF;
END $$;

-- Status check constraint idempotent
DO $$ DECLARE
  conname text;
  named_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'branches' AND c.conname = 'branches_status_check'
  ) INTO named_exists;

  IF NOT named_exists THEN
    SELECT c.conname INTO conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'branches' AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE '%status IN%';
    IF conname IS NOT NULL THEN
      EXECUTE format('ALTER TABLE branches DROP CONSTRAINT %I', conname);
    END IF;
    ALTER TABLE branches
      ADD CONSTRAINT branches_status_check CHECK (status IN ('active','inactive','suspended'));
  END IF;
END $$;

-- Branch-specific configurations
CREATE TABLE IF NOT EXISTS branch_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  config_type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(branch_id, config_key)
);
CREATE INDEX IF NOT EXISTS idx_branch_configurations_branch_id ON branch_configurations(branch_id);

-- Branch admin assignments
CREATE TABLE IF NOT EXISTS branch_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'branch_admin',
  permissions JSONB DEFAULT '[]'::jsonb,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(branch_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_branch_admins_branch_id ON branch_admins(branch_id);

-- Branch-level user assignments
CREATE TABLE IF NOT EXISTS branch_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) CHECK (user_type IN ('student','teacher','staff','parent')),
  primary_branch BOOLEAN DEFAULT TRUE,
  enrollment_date DATE,
  transfer_date DATE,
  transfer_reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(branch_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_branch_users_branch_id ON branch_users(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_users_user_id ON branch_users(user_id);

-- Shared master data with branch overrides
CREATE TABLE IF NOT EXISTS branch_master_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  master_type VARCHAR(50) NOT NULL,
  master_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  branch_specific_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(branch_id, master_type, master_id)
);
CREATE INDEX IF NOT EXISTS idx_branch_master_data_branch_id ON branch_master_data(branch_id);

-- Branch-specific roles
CREATE TABLE IF NOT EXISTS branch_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_system_role BOOLEAN DEFAULT FALSE,
  hierarchy_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(branch_id, name)
);
CREATE INDEX IF NOT EXISTS idx_branch_roles_branch_id ON branch_roles(branch_id);

-- User branch permissions
CREATE TABLE IF NOT EXISTS user_branch_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  role_id UUID REFERENCES branch_roles(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_user_branch_permissions_user_id ON user_branch_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_branch_permissions_branch_id ON user_branch_permissions(branch_id);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_branch_permissions' AND constraint_name = 'user_branch_permissions_user_branch_unique'
  ) THEN
    ALTER TABLE user_branch_permissions ADD CONSTRAINT user_branch_permissions_user_branch_unique UNIQUE (user_id, branch_id);
  END IF;
END $$;

-- Branch module access control
CREATE TABLE IF NOT EXISTS branch_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  module_name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::jsonb,
  enabled_features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(branch_id, module_name)
);
CREATE INDEX IF NOT EXISTS idx_branch_modules_branch_id ON branch_modules(branch_id);
