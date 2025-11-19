const db = require('../../utils/database/connection');

exports.markAttendance = async (req, res, next) => {
  try {
    const { employee_id, date, check_in, check_out, status, notes } = req.body || {};
    if (!employee_id) return res.status(400).json({ message: 'employee_id is required' });
    const { rows: erows } = await db.query('SELECT id, branch_id FROM employees WHERE id = $1', [employee_id]);
    const emp = erows[0];
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    if (req.scope?.branchId && emp.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const d = date ? date : new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const sql = `
      INSERT INTO attendance_records (employee_id, attendance_date, check_in, check_out, status, notes)
      VALUES ($1,$2,$3,$4,COALESCE($5,'present'),$6)
      ON CONFLICT (employee_id, attendance_date)
      DO UPDATE SET
        check_in = COALESCE(EXCLUDED.check_in, attendance_records.check_in),
        check_out = COALESCE(EXCLUDED.check_out, attendance_records.check_out),
        status = COALESCE(EXCLUDED.status, attendance_records.status),
        notes = COALESCE(EXCLUDED.notes, attendance_records.notes)
      RETURNING id, employee_id, attendance_date, check_in, check_out, status, notes
    `;
    const { rows } = await db.query(sql, [employee_id, d, check_in || null, check_out || null, status || null, notes || null]);
    // compute worked_hours if both present
    const rec = rows[0];
    if (rec.check_in && rec.check_out) {
      await db.query(
        `UPDATE attendance_records
         SET worked_hours = ROUND(EXTRACT(EPOCH FROM (check_out - check_in)) / 3600.0, 2)
         WHERE id = $1`,
        [rec.id]
      );
    }
    res.status(201).json({ record: rows[0] });
  } catch (e) { next(e); }
};

exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { from, to, employee_id, status } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`ar.employee_id = $${i++}`); vals.push(employee_id); }
    if (status) { where.push(`ar.status = $${i++}`); vals.push(status); }
    if (from) { where.push(`ar.attendance_date >= $${i++}`); vals.push(from); }
    if (to) { where.push(`ar.attendance_date <= $${i++}`); vals.push(to); }
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT ar.*, e.first_name, e.last_name, e.employee_id AS emp_code,
              d.name AS department, dg.title AS designation
       FROM attendance_records ar
       JOIN employees e ON e.id = ar.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN designations dg ON dg.id = e.designation_id
       ${whereSql}
       ORDER BY ar.attendance_date DESC, e.employee_id ASC
       LIMIT 1000`, vals
    );
    res.json({ records: rows });
  } catch (e) { next(e); }
};

exports.regularizeAttendance = async (req, res, next) => {
  try {
    const { employee_id, attendance_date, requested_check_in, requested_check_out, reason, supporting_document_url } = req.body || {};
    if (!employee_id || !attendance_date) return res.status(400).json({ message: 'employee_id and attendance_date are required' });
    const { rows: erows } = await db.query('SELECT id, branch_id FROM employees WHERE id = $1', [employee_id]);
    const emp = erows[0];
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    if (req.scope?.branchId && emp.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { rows } = await db.query(
      `INSERT INTO attendance_regularization (employee_id, attendance_date, requested_check_in, requested_check_out, reason, supporting_document_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [employee_id, attendance_date, requested_check_in || null, requested_check_out || null, reason || null, supporting_document_url || null]
    );
    res.status(201).json({ request: rows[0] });
  } catch (e) { next(e); }
};

exports.listRegularization = async (req, res, next) => {
  try {
    const { status, employee_id, from, to } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`r.employee_id = $${i++}`); vals.push(employee_id); }
    if (status) { where.push(`r.status = $${i++}`); vals.push(status); }
    if (from) { where.push(`r.attendance_date >= $${i++}`); vals.push(from); }
    if (to) { where.push(`r.attendance_date <= $${i++}`); vals.push(to); }
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT r.*, e.first_name, e.last_name, e.employee_id AS emp_code
       FROM attendance_regularization r
       JOIN employees e ON e.id = r.employee_id
       ${whereSql}
       ORDER BY r.created_at DESC
       LIMIT 500`, vals
    );
    res.json({ requests: rows });
  } catch (e) { next(e); }
};

exports.approveRegularization = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { action } = req.body || {}; // 'approve' | 'reject'
    if (!['approve','reject'].includes(action)) return res.status(400).json({ message: 'action must be approve or reject' });
    const { rows } = await db.query(
      `SELECT r.*, e.branch_id FROM attendance_regularization r JOIN employees e ON e.id = r.employee_id WHERE r.id = $1`, [id]
    );
    const reqRow = rows[0];
    if (!reqRow) return res.status(404).json({ message: 'Not found' });
    if (req.scope?.branchId && reqRow.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await db.query('BEGIN');
    if (action === 'approve') {
      await db.query(
        `INSERT INTO attendance_records (employee_id, attendance_date, check_in, check_out, status, notes)
         VALUES ($1,$2,$3,$4,'present','regularized')
         ON CONFLICT (employee_id, attendance_date)
         DO UPDATE SET
           check_in = COALESCE(EXCLUDED.check_in, attendance_records.check_in),
           check_out = COALESCE(EXCLUDED.check_out, attendance_records.check_out),
           status = COALESCE(EXCLUDED.status, attendance_records.status)`,
        [reqRow.employee_id, reqRow.attendance_date, reqRow.requested_check_in || null, reqRow.requested_check_out || null]
      );
    }
    await db.query(`UPDATE attendance_regularization SET status = $1, reviewed_at = NOW(), reviewed_by = $2 WHERE id = $3`, [action === 'approve' ? 'approved' : 'rejected', req.user.id, id]);
    await db.query('COMMIT');
    res.json({ success: true });
  } catch (e) { await db.query('ROLLBACK'); next(e); }
};

exports.uploadBulkAttendance = async (req, res, next) => {
  try {
    const records = Array.isArray(req.body?.records) ? req.body.records : [];
    if (!records.length) return res.status(400).json({ message: 'records array required' });
    await db.query('BEGIN');
    for (const r of records) {
      const { employee_id, date, check_in, check_out, status, notes } = r;
      if (!employee_id) continue;
      if (req.scope?.branchId) {
        const { rows: erows } = await db.query('SELECT branch_id FROM employees WHERE id = $1', [employee_id]);
        const emp = erows[0];
        if (!emp) continue;
        if (emp.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) continue;
      }
      await db.query(
        `INSERT INTO attendance_records (employee_id, attendance_date, check_in, check_out, status, notes)
         VALUES ($1,$2,$3,$4,COALESCE($5,'present'),$6)
         ON CONFLICT (employee_id, attendance_date)
         DO UPDATE SET
           check_in = COALESCE(EXCLUDED.check_in, attendance_records.check_in),
           check_out = COALESCE(EXCLUDED.check_out, attendance_records.check_out),
           status = COALESCE(EXCLUDED.status, attendance_records.status),
           notes = COALESCE(EXCLUDED.notes, attendance_records.notes)`,
        [employee_id, date, check_in || null, check_out || null, status || null, notes || null]
      );
    }
    await db.query('COMMIT');
    res.json({ success: true, count: records.length });
  } catch (e) {
    await db.query('ROLLBACK');
    next(e);
  }
};
