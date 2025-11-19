const db = require('../utils/database/connection');

async function isModuleEnabled(slug) {
  const { rows } = await db.query('SELECT is_enabled FROM modules WHERE slug = $1', [slug]);
  if (!rows.length) return false;
  return !!rows[0].is_enabled;
}

async function getFlag(moduleSlug, flagKey) {
  const { rows } = await db.query(
    'SELECT enabled, config FROM feature_flags WHERE module_slug = $1 AND flag_key = $2',
    [moduleSlug, flagKey]
  );
  return rows[0] || null;
}

module.exports = { isModuleEnabled, getFlag };
