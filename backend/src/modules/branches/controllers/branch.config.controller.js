const db = require('../../../utils/database/connection');

exports.list = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT id, config_key, config_value, config_type, description, is_active, created_at, updated_at
       FROM branch_configurations WHERE branch_id = $1 AND is_active = TRUE ORDER BY config_key ASC`,
      [id]
    );
    res.json({ configs: rows });
  } catch (e) { next(e); }
};

exports.upsert = async (req, res, next) => {
  try {
    const { id, key } = req.params; // branch id and config key
    const { value, type = 'string', description = null, is_active = true } = req.body;
    const { rows } = await db.query(
      `INSERT INTO branch_configurations (branch_id, config_key, config_value, config_type, description, is_active)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (branch_id, config_key) DO UPDATE SET config_value = EXCLUDED.config_value, config_type = EXCLUDED.config_type, description = EXCLUDED.description, is_active = EXCLUDED.is_active, updated_at = NOW()
       RETURNING id, branch_id, config_key, config_value, config_type, description, is_active, created_at, updated_at`,
      [id, key, JSON.stringify(value), type, description, is_active]
    );
    res.json({ config: rows[0] });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id, key } = req.params;
    await db.query('UPDATE branch_configurations SET is_active = FALSE, updated_at = NOW() WHERE branch_id = $1 AND config_key = $2', [id, key]);
    res.json({ success: true });
  } catch (e) { next(e); }
};
