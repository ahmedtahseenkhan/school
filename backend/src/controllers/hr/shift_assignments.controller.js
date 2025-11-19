const db = require('../../utils/database/connection');

exports.listAssignments = async (req, res, next) => {
  try {
    const { employee_id, shift_id, from, to } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`es.employee_id = $${i++}`); vals.push(employee_id); }
    if (shift_id) { where.push(`es.shift_id = $${i++}`); vals.push(shift_id); }
    if (from) { where.push(`es.effective_date >= $${i++}`); vals.push(from); }
    if (to) { where.push(`(es.end_date IS NULL OR es.end_date <= $${i++})`); vals.push(to); }
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT es.*, s.name AS shift_name, e.first_name, e.last_name, e.employee_id AS emp_code
       FROM employee_shifts es
       JOIN shifts s ON s.id = es.shift_id
       JOIN employees e ON e.id = es.employee_id
       ${whereSql}
       ORDER BY es.effective_date DESC`, vals
    );
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.employee_id || !p.shift_id || !p.effective_date) return res.status(400).json({ message: 'employee_id, shift_id, effective_date required' });
    const { rows } = await db.query(
      `INSERT INTO employee_shifts (employee_id, shift_id, effective_date, end_date, assigned_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [p.employee_id, p.shift_id, p.effective_date, p.end_date || null, p.assigned_by || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['shift_id','effective_date','end_date','assigned_by'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employee_shifts WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE employee_shifts SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteAssignment = async (req, res, next) => {
  try { await db.query('DELETE FROM employee_shifts WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};
