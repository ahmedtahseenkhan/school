CREATE TABLE IF NOT EXISTS modules (
  slug VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug VARCHAR(100) REFERENCES modules(slug) ON DELETE CASCADE,
  flag_key VARCHAR(150) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (module_slug, flag_key)
);
