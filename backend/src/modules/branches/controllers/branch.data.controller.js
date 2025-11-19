const db = require('../../../utils/database/connection');

exports.upsertMasterData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { master_type, master_id, branch_specific_data = {}, is_active = true } = req.body;
    const { rows } = await db.query(
      `INSERT INTO branch_master_data (branch_id, master_type, master_id, branch_specific_data, is_active)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (branch_id, master_type, master_id) DO UPDATE SET branch_specific_data = EXCLUDED.branch_specific_data, is_active = EXCLUDED.is_active
       RETURNING id, branch_id, master_type, master_id, branch_specific_data, is_active, created_at`,
      [id, master_type, master_id, JSON.stringify(branch_specific_data), is_active]
    );
    res.status(201).json({ record: rows[0] });
  } catch (e) { next(e); }
};
