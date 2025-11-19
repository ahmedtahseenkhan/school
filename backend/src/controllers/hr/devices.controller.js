const db = require('../../utils/database/connection');

exports.listDevices = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    let i = 1;
    if (req.scope?.branchId) { where.push(`branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT * FROM attendance_devices ${whereSql} ORDER BY created_at DESC` , vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createDevice = async (req, res, next) => {
  try {
    const p = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.device_name || !p.device_id) return res.status(400).json({ message: 'branch_id, device_name, device_id required' });
    const { rows } = await db.query(
      `INSERT INTO attendance_devices (branch_id, device_name, device_id, device_type, location, ip_address, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,true)) RETURNING *`,
      [p.branch_id, p.device_name, p.device_id, p.device_type || null, p.location || null, p.ip_address || null, p.is_active ?? true]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateDevice = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['device_name','device_type','location','ip_address','is_active'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM attendance_devices WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE attendance_devices SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteDevice = async (req, res, next) => {
  try { await db.query('DELETE FROM attendance_devices WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};
