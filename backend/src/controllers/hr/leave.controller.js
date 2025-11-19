const db = require('../../utils/database/connection');

exports.applyLeave = async (req, res, next) => {
  try {
    const { employee_id, leave_type_id, start_date, end_date, reason, contact_during_leave, medical_certificate_url } = req.body || {};
    if (!employee_id || !leave_type_id || !start_date || !end_date) return res.status(400).json({ message: 'employee_id, leave_type_id, start_date, end_date required' });
    const { rows: erows } = await db.query('SELECT branch_id FROM employees WHERE id = $1', [employee_id]);
    const emp = erows[0];
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    if (req.scope?.branchId && emp.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { rows } = await db.query(
      `INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, medical_certificate_url, contact_during_leave)
       VALUES ($1,$2,$3,$4, GREATEST(1, (CAST($4 AS DATE) - CAST($3 AS DATE)) + 1), $5, $6, $7)
       RETURNING *`,
      [employee_id, leave_type_id, start_date, end_date, reason || null, medical_certificate_url || null, contact_during_leave || null]
    );
    res.status(201).json({ application: rows[0] });
  } catch (e) { next(e); }
};

exports.getLeaveApplications = async (req, res, next) => {
  try {
    const { employee_id, status, from, to } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`la.employee_id = $${i++}`); vals.push(employee_id); }
    if (status) { where.push(`la.status = $${i++}`); vals.push(status); }
    if (from) { where.push(`la.start_date >= $${i++}`); vals.push(from); }
    if (to) { where.push(`la.end_date <= $${i++}`); vals.push(to); }
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT la.*, e.first_name, e.last_name, e.employee_id AS emp_code, lt.name AS leave_type
       FROM leave_applications la
       JOIN employees e ON e.id = la.employee_id
       JOIN leave_types lt ON lt.id = la.leave_type_id
       ${whereSql}
       ORDER BY la.created_at DESC
       LIMIT 500`, vals
    );
    res.json({ applications: rows });
  } catch (e) { next(e); }
};

exports.approveLeave = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status, rejection_reason, approved_by } = req.body || {};
    if (!['approved','rejected','cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const { rows: ar } = await db.query(
      `SELECT la.id, e.branch_id FROM leave_applications la JOIN employees e ON e.id = la.employee_id WHERE la.id = $1`, [id]
    );
    const app = ar[0];
    if (!app) return res.status(404).json({ message: 'Not found' });
    if (req.scope?.branchId && app.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { rows } = await db.query(
      `UPDATE leave_applications SET status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = $3
       WHERE id = $4
       RETURNING *`,
      [status, approved_by || req.user?.employee_id || null, rejection_reason || null, id]
    );
    res.json({ application: rows[0] });
  } catch (e) { next(e); }
};

exports.getLeaveBalance = async (req, res, next) => {
  try {
    const { employee_id, year } = req.query;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const where = [`lq.year = $1`];
    const vals = [y];
    let i = 2;
    if (employee_id) { where.push(`lq.employee_id = $${i++}`); vals.push(employee_id); }
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT lq.*, lt.name AS leave_type, e.first_name, e.last_name, e.employee_id AS emp_code
       FROM leave_quotas lq
       JOIN leave_types lt ON lt.id = lq.leave_type_id
       JOIN employees e ON e.id = lq.employee_id
       ${whereSql}
       ORDER BY e.employee_id ASC, lt.name ASC`, vals
    );
    res.json({ balances: rows });
  } catch (e) { next(e); }
};

// Leave Adjustments
exports.listLeaveAdjustments = async (req, res, next) => {
  try {
    const { employee_id, year } = req.query || {};
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`la.employee_id = $${i++}`); vals.push(employee_id); }
    if (year) { where.push(`la.year = $${i++}`); vals.push(year); }
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT la.*, e.employee_id AS emp_code, e.first_name, e.last_name, lt.name AS leave_type
       FROM leave_adjustments la
       JOIN employees e ON e.id = la.employee_id
       JOIN leave_types lt ON lt.id = la.leave_type_id
       ${whereSql}
       ORDER BY la.created_at DESC
       LIMIT 500`,
      vals
    );
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createLeaveAdjustment = async (req, res, next) => {
  const client = await db.getClient?.() || db;
  try {
    const { employee_id, leave_type_id, year, adjustment_days, reason, reference_no } = req.body || {};
    if (!employee_id || !leave_type_id || !year || !adjustment_days) {
      return res.status(400).json({ message: 'employee_id, leave_type_id, year, adjustment_days required' });
    }

    // Ensure employee belongs to current branch
    const { rows: erows } = await client.query('SELECT branch_id FROM employees WHERE id = $1', [employee_id]);
    const emp = erows[0];
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    if (req.scope?.branchId && emp.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (client !== db) await client.query('BEGIN');

    const { rows: adjRows } = await client.query(
      `INSERT INTO leave_adjustments (branch_id, employee_id, leave_type_id, year, adjustment_days, reason, reference_no, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [emp.branch_id, employee_id, leave_type_id, year, adjustment_days, reason || null, reference_no || null, req.user?.id || null]
    );

    // Update or create leave quota row
    const { rows: qrows } = await client.query(
      'SELECT id, total_days, used_days, remaining_days, carried_forward_days FROM leave_quotas WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3',
      [employee_id, leave_type_id, year]
    );
    if (qrows[0]) {
      const q = qrows[0];
      const newRemaining = (q.remaining_days || 0) + adjustment_days;
      await client.query(
        'UPDATE leave_quotas SET remaining_days = $1 WHERE id = $2',
        [newRemaining, q.id]
      );
    } else {
      await client.query(
        `INSERT INTO leave_quotas (employee_id, leave_type_id, year, total_days, used_days, remaining_days, carried_forward_days)
         VALUES ($1,$2,$3,$4,0,$4,0)`,
        [employee_id, leave_type_id, year, adjustment_days]
      );
    }

    if (client !== db) await client.query('COMMIT');

    res.status(201).json({ item: adjRows[0] });
  } catch (e) {
    if (client !== db) try { await client.query('ROLLBACK'); } catch (_) {}
    next(e);
  } finally {
    if (client.release) client.release();
  }
};
