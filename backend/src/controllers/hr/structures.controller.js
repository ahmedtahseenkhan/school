const db = require('../../utils/database/connection');

async function insertAuditLog(req, { employeeId, entityType, entityId, action, oldValues, newValues }) {
  try {
    await db.query(
      `INSERT INTO audit_log (employee_id, entity_type, entity_id, action, old_values, new_values, performed_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        employeeId || null,
        entityType,
        entityId || null,
        action,
        oldValues || null,
        newValues || null,
        req.user?.id || null
      ]
    );
  } catch (e) {
    console.error('Audit log insert failed', e);
  }
}

// Leave Quotas
exports.listLeaveQuotas = async (req, res, next) => {
  try {
    const { employee_id, year } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`lq.employee_id = $${i++}`); vals.push(employee_id); }
    if (year) { where.push(`lq.year = $${i++}`); vals.push(year); }
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT lq.*, lt.name AS leave_type, e.first_name, e.last_name
       FROM leave_quotas lq
       JOIN employees e ON e.id = lq.employee_id
       JOIN leave_types lt ON lt.id = lq.leave_type_id
       ${whereSql}
       ORDER BY lq.year DESC, e.employee_id ASC, lt.name ASC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createLeaveQuota = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.employee_id || !p.leave_type_id || !p.year) return res.status(400).json({ message: 'employee_id, leave_type_id, year required' });
    const { rows } = await db.query(
      `INSERT INTO leave_quotas (employee_id, leave_type_id, year, total_days, used_days, remaining_days, carried_forward_days)
       VALUES ($1,$2,$3,COALESCE($4,0),COALESCE($5,0),COALESCE($6,0),COALESCE($7,0)) RETURNING *`,
      [p.employee_id, p.leave_type_id, p.year, p.total_days, p.used_days, p.remaining_days, p.carried_forward_days]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateLeaveQuota = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['total_days','used_days','remaining_days','carried_forward_days'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM leave_quotas WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE leave_quotas SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteLeaveQuota = async (req, res, next) => {
  try { await db.query('DELETE FROM leave_quotas WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// Salary Structure (employee_salary_structure)
exports.listSalaryStructure = async (req, res, next) => {
  try {
    const { employee_id } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`es.employee_id = $${i++}`); vals.push(employee_id); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT es.*, sc.name, sc.type, sc.calculation_type
       FROM employee_salary_structure es
       JOIN salary_components sc ON sc.id = es.component_id
       ${whereSql}
       ORDER BY es.effective_date DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createSalaryStructure = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.employee_id || !p.component_id || p.amount == null || !p.effective_date) return res.status(400).json({ message: 'employee_id, component_id, amount, effective_date required' });
    const { rows } = await db.query(
      `INSERT INTO employee_salary_structure (employee_id, component_id, amount, percentage_base, effective_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [p.employee_id, p.component_id, p.amount, p.percentage_base || null, p.effective_date, p.end_date || null]
    );
    const item = rows[0];
    await insertAuditLog(req, {
      employeeId: item?.employee_id,
      entityType: 'salary_structure',
      entityId: item?.id,
      action: 'create',
      oldValues: null,
      newValues: item
    });
    res.status(201).json({ item });
  } catch (e) { next(e); }
};

exports.updateSalaryStructure = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['amount','percentage_base','effective_date','end_date'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employee_salary_structure WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    const { rows: beforeRows } = await db.query('SELECT * FROM employee_salary_structure WHERE id = $1', [id]);
    const oldItem = beforeRows[0] || null;
    vals.push(id);
    const { rows } = await db.query(`UPDATE employee_salary_structure SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    const item = rows[0];
    await insertAuditLog(req, {
      employeeId: item?.employee_id || oldItem?.employee_id,
      entityType: 'salary_structure',
      entityId: id,
      action: 'update',
      oldValues: oldItem,
      newValues: item
    });
    res.json({ item });
  } catch (e) { next(e); }
};

exports.deleteSalaryStructure = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { rows: beforeRows } = await db.query('SELECT * FROM employee_salary_structure WHERE id = $1', [id]);
    const oldItem = beforeRows[0] || null;
    await db.query('DELETE FROM employee_salary_structure WHERE id = $1', [id]);
    await insertAuditLog(req, {
      employeeId: oldItem?.employee_id,
      entityType: 'salary_structure',
      entityId: id,
      action: 'delete',
      oldValues: oldItem,
      newValues: null
    });
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.listRecurringDeductions = async (req, res, next) => {
  try {
    const { employee_id, status } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`rd.employee_id = $${i++}`); vals.push(employee_id); }
    if (status) { where.push(`rd.status = $${i++}`); vals.push(status); }
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT
         rd.*,
         sc.name AS component_name,
         sc.type,
         sc.calculation_type,
         e.employee_id,
         e.first_name,
         e.last_name
       FROM employee_recurring_deductions rd
       JOIN employees e ON e.id = rd.employee_id
       JOIN salary_components sc ON sc.id = rd.component_id
       ${whereSql}
       ORDER BY e.employee_id ASC, sc.name ASC`,
      vals
    );
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createRecurringDeduction = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.employee_id || !p.component_id || p.amount == null || !p.start_date) {
      return res.status(400).json({ message: 'employee_id, component_id, amount, start_date required' });
    }
    const { rows } = await db.query(
      `INSERT INTO employee_recurring_deductions (employee_id, component_id, amount, start_date, end_date, frequency, status)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,'monthly'),COALESCE($7,'active')) RETURNING *`,
      [p.employee_id, p.component_id, p.amount, p.start_date, p.end_date || null, p.frequency || null, p.status || null]
    );
    const item = rows[0];
    await insertAuditLog(req, {
      employeeId: item?.employee_id,
      entityType: 'recurring_deduction',
      entityId: item?.id,
      action: 'create',
      oldValues: null,
      newValues: item
    });
    res.status(201).json({ item });
  } catch (e) { next(e); }
};

exports.updateRecurringDeduction = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['amount','start_date','end_date','frequency','status'];
    const sets = [];
    const vals = [];
    let i = 1;
    for (const [k, v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    }
    if (!sets.length) {
      const { rows } = await db.query('SELECT * FROM employee_recurring_deductions WHERE id = $1', [id]);
      return res.json({ item: rows[0] });
    }
    const { rows: beforeRows } = await db.query('SELECT * FROM employee_recurring_deductions WHERE id = $1', [id]);
    const oldItem = beforeRows[0] || null;
    vals.push(id);
    const { rows } = await db.query(
      `UPDATE employee_recurring_deductions SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      vals
    );
    const item = rows[0];
    await insertAuditLog(req, {
      employeeId: item?.employee_id || oldItem?.employee_id,
      entityType: 'recurring_deduction',
      entityId: id,
      action: 'update',
      oldValues: oldItem,
      newValues: item
    });
    res.json({ item });
  } catch (e) { next(e); }
};

exports.deleteRecurringDeduction = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { rows: beforeRows } = await db.query('SELECT * FROM employee_recurring_deductions WHERE id = $1', [id]);
    const oldItem = beforeRows[0] || null;
    await db.query('DELETE FROM employee_recurring_deductions WHERE id = $1', [id]);
    await insertAuditLog(req, {
      employeeId: oldItem?.employee_id,
      entityType: 'recurring_deduction',
      entityId: id,
      action: 'delete',
      oldValues: oldItem,
      newValues: null
    });
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.listAuditLog = async (req, res, next) => {
  try {
    const { employee_id, entity_type, action, from, to } = req.query || {};
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`al.employee_id = $${i++}`); vals.push(employee_id); }
    if (entity_type) { where.push(`al.entity_type = $${i++}`); vals.push(entity_type); }
    if (action) { where.push(`al.action = $${i++}`); vals.push(action); }
    if (from) { where.push(`al.performed_at >= $${i++}`); vals.push(from); }
    if (to) { where.push(`al.performed_at <= $${i++}`); vals.push(to); }
    if (req.scope?.branchId) {
      where.push(`(e.branch_id = $${i++} OR e.branch_id IS NULL)`);
      vals.push(req.scope.branchId);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT
         al.*,
         e.employee_id AS employee_code,
         e.first_name,
         e.last_name,
         u.email AS performed_by_email
       FROM audit_log al
       LEFT JOIN employees e ON e.id = al.employee_id
       LEFT JOIN users u ON u.id = al.performed_by
       ${whereSql}
       ORDER BY al.performed_at DESC
       LIMIT 500`,
      vals
    );
    res.json({ items: rows });
  } catch (e) { next(e); }
};
