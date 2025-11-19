CREATE TABLE IF NOT EXISTS tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  period_date DATE NOT NULL,
  active_users INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  features_used JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant ON tenant_usage(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_tenant_usage_period ON tenant_usage(tenant_id, period_date);
