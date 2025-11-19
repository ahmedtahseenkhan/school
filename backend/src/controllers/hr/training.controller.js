const db = require('../../utils/database/connection');

// Training Programs
exports.listPrograms = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    let i = 1;
    if (req.scope?.branchId) { where.push(`tp.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT tp.* FROM training_programs tp ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createProgram = async (req, res, next) => {
  try {
    const p = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.title) return res.status(400).json({ message: 'branch_id and title required' });
    const { rows } = await db.query(
      `INSERT INTO training_programs (branch_id, title, description, trainer_name, training_type, start_date, end_date, duration_hours, max_participants, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'scheduled')) RETURNING *`,
      [p.branch_id, p.title, p.description || null, p.trainer_name || null, p.training_type || null, p.start_date || null, p.end_date || null, p.duration_hours || null, p.max_participants || null, p.status || 'scheduled']
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateProgram = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['title','description','trainer_name','training_type','start_date','end_date','duration_hours','max_participants','status'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM training_programs WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE training_programs SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteProgram = async (req, res, next) => {
  try { await db.query('DELETE FROM training_programs WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// Training Participants
exports.listParticipants = async (req, res, next) => {
  try {
    const { training_id } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (training_id) { where.push(`tp.training_id = $${i++}`); vals.push(training_id); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT tp.*, e.first_name, e.last_name, e.employee_id AS emp_code
       FROM training_participants tp
       JOIN employees e ON e.id = tp.employee_id
       ${whereSql}
       ORDER BY tp.created_at DESC`, vals
    );
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createParticipant = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.training_id || !p.employee_id) return res.status(400).json({ message: 'training_id and employee_id required' });
    const { rows } = await db.query(
      `INSERT INTO training_participants (training_id, employee_id, attendance_status, pre_training_rating, post_training_rating, feedback, certificate_url)
       VALUES ($1,$2,COALESCE($3,'registered'),$4,$5,$6,$7) RETURNING *`,
      [p.training_id, p.employee_id, p.attendance_status || 'registered', p.pre_training_rating || null, p.post_training_rating || null, p.feedback || null, p.certificate_url || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateParticipant = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['attendance_status','pre_training_rating','post_training_rating','feedback','certificate_url'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM training_participants WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE training_participants SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteParticipant = async (req, res, next) => {
  try { await db.query('DELETE FROM training_participants WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};
