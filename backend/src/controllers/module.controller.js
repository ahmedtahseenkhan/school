const db = require('../utils/database/connection');

exports.list = async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT slug, name, description, is_enabled, created_at, updated_at FROM modules ORDER BY slug');
    res.json({ modules: rows });
  } catch (e) { next(e); }
};

exports.setEnabled = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') return res.status(400).json({ message: 'enabled boolean required' });
    const { rows } = await db.query('UPDATE modules SET is_enabled = $1, updated_at = NOW() WHERE slug = $2 RETURNING slug, name, is_enabled', [enabled, slug]);
    if (!rows.length) return res.status(404).json({ message: 'Module not found' });
    res.json({ module: rows[0] });
  } catch (e) { next(e); }
};

exports.listFlags = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { rows } = await db.query('SELECT id, flag_key, enabled, config FROM feature_flags WHERE module_slug = $1 ORDER BY flag_key', [slug]);
    res.json({ flags: rows });
  } catch (e) { next(e); }
};

exports.setFlag = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { flag_key, enabled, config } = req.body;
    if (!flag_key || typeof enabled !== 'boolean') return res.status(400).json({ message: 'flag_key and enabled required' });
    const result = await db.query(
      `INSERT INTO feature_flags (module_slug, flag_key, enabled, config)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (module_slug, flag_key) DO UPDATE SET enabled = EXCLUDED.enabled, config = EXCLUDED.config, updated_at = NOW()
       RETURNING id, module_slug, flag_key, enabled, config`,
      [slug, flag_key, enabled, JSON.stringify(config || {})]
    );
    res.json({ flag: result.rows[0] });
  } catch (e) { next(e); }
};
