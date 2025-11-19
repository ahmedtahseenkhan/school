const db = require('../../utils/database/connection');

exports.processPayroll = async (req, res, next) => {
  try {
    const { period_id, branch_id, period_name, start_date, end_date, payment_date } = req.body || {};
    let pid = period_id;
    if (!pid) {
      if (!branch_id || !period_name || !start_date || !end_date) return res.status(400).json({ message: 'branch_id, period_name, start_date, end_date required' });
      const { rows } = await db.query(
        `INSERT INTO payroll_periods (branch_id, period_name, start_date, end_date, payment_date, status)
         VALUES ($1,$2,$3,$4,$5,'processing') RETURNING id`,
        [branch_id, period_name, start_date, end_date, payment_date || null]
      );
      pid = rows[0].id;
    }
    const { rows: pRows } = await db.query('SELECT * FROM payroll_periods WHERE id = $1', [pid]);
    const p = pRows[0];
    if (!p) return res.status(404).json({ message: 'Payroll period not found' });
    const scopeBranch = req.scope?.branchId || p.branch_id;
    // Pull active employees in branch
    const { rows: emps } = await db.query(
      `SELECT id FROM employees WHERE branch_id = $1 AND employment_status IN ('active','probation')`,
      [scopeBranch]
    );
    // For each employee, compute totals from salary structure
    for (const e of emps) {
      const { rows: comps } = await db.query(
        `SELECT c.id as component_id, c.type, c.calculation_type, es.amount
         FROM employee_salary_structure es
         JOIN salary_components c ON c.id = es.component_id
         WHERE es.employee_id = $1 AND es.effective_date <= $2 AND (es.end_date IS NULL OR es.end_date >= $3)`,
        [e.id, p.end_date, p.start_date]
      );
      const { rows: recurring } = await db.query(
        `SELECT c.id as component_id, 'deduction' AS type, 'fixed' AS calculation_type, erd.amount
         FROM employee_recurring_deductions erd
         JOIN salary_components c ON c.id = erd.component_id
         WHERE erd.employee_id = $1
           AND erd.status = 'active'
           AND erd.frequency = 'monthly'
           AND erd.start_date <= $2
           AND (erd.end_date IS NULL OR erd.end_date >= $3)`,
        [e.id, p.end_date, p.start_date]
      );
      const allComps = [...comps, ...recurring];
      let gross = 0, ded = 0;
      for (const c of allComps) {
        const amt = Number(c.amount || 0);
        if (c.type === 'earning') gross += amt; else ded += amt;
      }
      const net = +(gross - ded).toFixed(2);
      const { rows: inserted } = await db.query(
        `INSERT INTO payroll_records (payroll_period_id, employee_id, gross_earnings, total_deductions, net_salary, status)
         VALUES ($1,$2,$3,$4,$5,'completed')
         ON CONFLICT DO NOTHING RETURNING id`,
        [pid, e.id, gross, ded, net]
      );
      const rid = inserted[0]?.id;
      if (rid) {
        for (const c of allComps) {
          const amt = Number(c.amount || 0);
          await db.query(
            `INSERT INTO payroll_details (payroll_record_id, component_id, amount, type)
             VALUES ($1,$2,$3,$4)`,
            [rid, c.component_id, amt, c.type]
          );
        }
      }
    }
    await db.query(`UPDATE payroll_periods SET status = 'completed' WHERE id = $1`, [pid]);
    res.json({ period_id: pid, processed: emps.length });
  } catch (e) { next(e); }
};

exports.getPayslip = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;
    const periodId = req.query.period_id;
    let record;
    if (periodId) {
      const { rows } = await db.query(`SELECT * FROM payroll_records WHERE employee_id = $1 AND payroll_period_id = $2`, [employeeId, periodId]);
      record = rows[0];
    } else {
      const { rows } = await db.query(
        `SELECT pr.* FROM payroll_records pr JOIN payroll_periods pp ON pp.id = pr.payroll_period_id
         WHERE pr.employee_id = $1 AND pp.status = 'completed'
         ORDER BY pp.end_date DESC LIMIT 1`,
        [employeeId]
      );
      record = rows[0];
    }
    if (!record) return res.status(404).json({ message: 'Payslip not found' });
    const { rows: details } = await db.query(`SELECT pd.*, sc.name FROM payroll_details pd JOIN salary_components sc ON sc.id = pd.component_id WHERE pd.payroll_record_id = $1`, [record.id]);
    res.json({ record, details });
  } catch (e) { next(e); }
};

exports.getPayrollReport = async (req, res, next) => {
  try {
    const { period_id } = req.query;
    if (!period_id) return res.status(400).json({ message: 'period_id required' });
    const { rows } = await db.query(
      `SELECT SUM(net_salary) AS total_net, SUM(gross_earnings) AS total_gross, SUM(total_deductions) AS total_deductions, COUNT(*) AS employee_count
       FROM payroll_records WHERE payroll_period_id = $1`,
      [period_id]
    );
    res.json({ summary: rows[0] });
  } catch (e) { next(e); }
};

exports.getTaxDeductionReport = async (req, res, next) => {
  try {
    const { period_id } = req.query;
    if (!period_id) return res.status(400).json({ message: 'period_id required' });

    const { rows: pRows } = await db.query('SELECT * FROM payroll_periods WHERE id = $1', [period_id]);
    const period = pRows[0];
    if (!period) return res.status(404).json({ message: 'Payroll period not found' });
    if (req.scope?.branchId && period.branch_id !== req.scope.branchId) {
      return res.status(403).json({ message: 'Access denied for this payroll period' });
    }

    const { rows: sRows } = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN pd.type = 'deduction' THEN pd.amount ELSE 0 END), 0)                         AS total_deductions,
         COALESCE(SUM(CASE WHEN pd.type = 'deduction' AND sc.is_taxable THEN pd.amount ELSE 0 END), 0)       AS total_taxable_deductions,
         COALESCE(SUM(CASE WHEN pd.type = 'deduction' AND NOT sc.is_taxable THEN pd.amount ELSE 0 END), 0)   AS total_nontax_deductions
       FROM payroll_details pd
       JOIN salary_components sc ON sc.id = pd.component_id
       JOIN payroll_records pr ON pr.id = pd.payroll_record_id
       WHERE pr.payroll_period_id = $1`,
      [period_id]
    );

    const { rows: compRows } = await db.query(
      `SELECT
         sc.id                    AS component_id,
         sc.name,
         sc.type,
         sc.is_taxable,
         COALESCE(SUM(pd.amount), 0)           AS total_amount,
         COUNT(DISTINCT pr.employee_id)        AS employee_count
       FROM payroll_details pd
       JOIN salary_components sc ON sc.id = pd.component_id
       JOIN payroll_records pr ON pr.id = pd.payroll_record_id
       WHERE pr.payroll_period_id = $1
         AND pd.type = 'deduction'
       GROUP BY sc.id, sc.name, sc.type, sc.is_taxable
       ORDER BY sc.name`,
      [period_id]
    );

    res.json({ period, summary: sRows[0] || null, components: compRows });
  } catch (e) { next(e); }
};

exports.listPayrollPeriods = async (req, res, next) => {
  try {
    const { status } = req.query || {};
    const where = [];
    const vals = [];
    let i = 1;
    if (req.scope?.branchId) {
      where.push(`pp.branch_id = $${i++}`);
      vals.push(req.scope.branchId);
    }
    if (status) {
      where.push(`pp.status = $${i++}`);
      vals.push(status);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT
         pp.*,
         COALESCE(COUNT(DISTINCT pr.id), 0)              AS employee_count,
         COALESCE(SUM(pr.gross_earnings), 0)             AS total_gross,
         COALESCE(SUM(pr.total_deductions), 0)           AS total_deductions,
         COALESCE(SUM(pr.net_salary), 0)                 AS total_net
       FROM payroll_periods pp
       LEFT JOIN payroll_records pr ON pr.payroll_period_id = pp.id
       ${whereSql}
       GROUP BY pp.id
       ORDER BY pp.start_date DESC, pp.created_at DESC`,
      vals
    );
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.getPayrollPeriod = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { rows } = await db.query('SELECT * FROM payroll_periods WHERE id = $1', [id]);
    const item = rows[0];
    if (!item) return res.status(404).json({ message: 'Payroll period not found' });
    res.json({ item });
  } catch (e) { next(e); }
};

exports.updatePayrollPeriod = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['period_name', 'start_date', 'end_date', 'payment_date', 'status'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k, v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) {
      const { rows } = await db.query('SELECT * FROM payroll_periods WHERE id = $1', [id]);
      return res.json({ item: rows[0] });
    }
    vals.push(id);
    const { rows } = await db.query(`UPDATE payroll_periods SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.getPayrollRegister = async (req, res, next) => {
  try {
    const periodId = req.params.id || req.query.period_id;
    if (!periodId) return res.status(400).json({ message: 'period_id required' });
    const { rows: pRows } = await db.query('SELECT * FROM payroll_periods WHERE id = $1', [periodId]);
    const period = pRows[0];
    if (!period) return res.status(404).json({ message: 'Payroll period not found' });
    if (req.scope?.branchId && period.branch_id !== req.scope.branchId) {
      return res.status(403).json({ message: 'Access denied for this payroll period' });
    }
    const { rows } = await db.query(
      `SELECT
         pr.*,
         e.employee_id,
         e.first_name,
         e.last_name
       FROM payroll_records pr
       JOIN employees e ON e.id = pr.employee_id
       WHERE pr.payroll_period_id = $1
       ORDER BY e.employee_id`,
      [periodId]
    );
    res.json({ period, records: rows });
  } catch (e) { next(e); }
};
