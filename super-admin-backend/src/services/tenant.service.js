const db = require('../utils/database/connection');

async function getAll() {
  const { rows } = await db.query('SELECT * FROM tenants ORDER BY created_at DESC');
  return rows;
}
async function create(payload) {
  const fields = ['name','code','subdomain','server_url','server_ip','database_name','plan_type','admin_email','admin_name','admin_phone','school_address','monthly_price'];
  const cols = []; const vals = []; const params = [];
  let i = 1;
  for (const f of fields) if (payload[f] !== undefined) { cols.push(f); vals.push(`$${i++}`); params.push(payload[f]); }
  const { rows } = await db.query(`INSERT INTO tenants (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`, params);
  return rows[0];
}
async function getById(id) { const { rows } = await db.query('SELECT * FROM tenants WHERE id = $1', [id]); return rows[0]; }
async function update(id, payload) {
  const entries = Object.entries(payload);
  if (!entries.length) return getById(id);
  let i = 1; const sets = []; const params = [];
  for (const [k,v] of entries) { sets.push(`${k} = $${i++}`); params.push(v); }
  params.push(id);
  const { rows } = await db.query(`UPDATE tenants SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`, params);
  return rows[0];
}
async function setStatus(id, status) { return update(id, { status }); }

async function getLatestUsage(tenantId) {
  const { rows } = await db.query('SELECT * FROM tenant_usage WHERE tenant_id = $1 ORDER BY period_date DESC LIMIT 1', [tenantId]);
  return rows[0] || null;
}
async function upsertUsage(tenantId, usage) {
  // simplistic monthly upsert by current month
  const period = new Date(); period.setDate(1);
  const { rows } = await db.query(
    `INSERT INTO tenant_usage (tenant_id, period_date, active_users, total_students, storage_used_mb, api_calls_count, features_used)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (tenant_id, period_date) DO UPDATE SET
       active_users = EXCLUDED.active_users,
       total_students = EXCLUDED.total_students,
       storage_used_mb = EXCLUDED.storage_used_mb,
       api_calls_count = EXCLUDED.api_calls_count,
       features_used = EXCLUDED.features_used
     RETURNING *`,
     [tenantId, period, usage.active_users||0, usage.total_students||0, usage.storage_used_mb||0, usage.api_calls_count||0, JSON.stringify(usage.features_used||[])]
  );
  return rows[0];
}
async function getModules(tenantId) {
  const { rows } = await db.query('SELECT module_name, module_slug, is_enabled, price_override, config FROM tenant_modules WHERE tenant_id = $1 ORDER BY module_name', [tenantId]);
  return rows;
}
async function updateModules(tenantId, modules) {
  await db.query('BEGIN');
  try {
    await db.query('DELETE FROM tenant_modules WHERE tenant_id = $1', [tenantId]);
    for (const m of modules) {
      await db.query(
        `INSERT INTO tenant_modules (tenant_id, module_name, module_slug, is_enabled, price_override, config)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [tenantId, m.module_name, m.module_slug, !!m.is_enabled, m.price_override || null, JSON.stringify(m.config || {})]
      );
    }
    await db.query('COMMIT');
  } catch (e) { await db.query('ROLLBACK'); throw e; }
  return getModules(tenantId);
}

module.exports = { getAll, create, getById, update, setStatus, getLatestUsage, upsertUsage, getModules, updateModules };
