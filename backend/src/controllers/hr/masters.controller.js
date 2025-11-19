const db = require('../../utils/database/connection');

function scopeBranch(where, vals, i, alias = '') {
  return (req) => {
    if (req.scope?.branchId) {
      where.push(`${alias ? alias + '.' : ''}branch_id = $${i.val++}`);
      vals.push(req.scope.branchId);
    }
  };
}

exports.listDepartments = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 'd')(req);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT d.* FROM departments d ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    // If a branch context is present, always default branch_id from it when not explicitly provided
    if (req.scope?.branchId && !payload.branch_id) payload.branch_id = req.scope.branchId;
    if (!payload.branch_id || !payload.name) return res.status(400).json({ message: 'branch_id and name required' });
    const { rows } = await db.query(
      `INSERT INTO departments (branch_id, name, code, description, head_employee_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [payload.branch_id, payload.name, payload.code || null, payload.description || null, payload.head_employee_id || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['name','code','description','head_employee_id'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) {
      const { rows } = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
      return res.json({ item: rows[0] });
    }
    vals.push(id);
    const { rows } = await db.query(`UPDATE departments SET ${sets.join(', ') } WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM departments WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.listDesignations = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 'g')(req);
    where.push('g.is_active IS DISTINCT FROM false');
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT g.* FROM designations g ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createDesignation = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) payload.branch_id = req.scope.branchId;
    if (!payload.branch_id || !payload.title) return res.status(400).json({ message: 'branch_id and title required' });
    const { rows } = await db.query(
      `INSERT INTO designations (branch_id, title, description, hierarchy_level, grade)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [payload.branch_id, payload.title, payload.description || null, payload.hierarchy_level || 0, payload.grade || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateDesignation = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['title','description','hierarchy_level','grade','is_active'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) {
      const { rows } = await db.query('SELECT * FROM designations WHERE id = $1', [id]);
      return res.json({ item: rows[0] });
    }
    vals.push(id);
    const { rows } = await db.query(`UPDATE designations SET ${sets.join(', ') } WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteDesignation = async (req, res, next) => {
  try {
    await db.query('UPDATE designations SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.listLeaveTypes = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 'lt')(req);
    where.push('lt.is_active IS DISTINCT FROM false');
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT lt.* FROM leave_types lt ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createLeaveType = async (req, res, next) => {
  try {
    const p = { ...req.body };
    // Always derive branch from current scope; client should not send branch_id
    if (!req.scope?.branchId) return res.status(400).json({ message: 'Branch context missing' });
    p.branch_id = req.scope.branchId;
    if (!p.name || !p.code) return res.status(400).json({ message: 'name and code are required' });
    const { rows } = await db.query(
      `INSERT INTO leave_types (
         branch_id, name, code, description,
         max_days_per_year, carry_forward_days, requires_medical_certificate, is_active, color,
         leave_unit, leaves_per_period, renew_on,
         max_avail_unit, max_avail, encashment_allowed,
         marital_status_filter, gender_filter,
         entitle_on, accrual_unit,
         allow_in_probation, quota_validate, paid_leave,
         request_before_days, request_unit,
         late_adjustable, include_holidays, early_dep_adjustable
       )
       VALUES (
         $1,$2,$3,$4,
         $5,$6,COALESCE($7,false),COALESCE($8,true),$9,
         $10,$11,$12,
         $13,$14,COALESCE($15,false),
         $16,$17,
         $18,$19,
         COALESCE($20,false),COALESCE($21,false),COALESCE($22,true),
         $23,$24,
         COALESCE($25,false),COALESCE($26,false),COALESCE($27,false)
       ) RETURNING *`,
      [
        p.branch_id, p.name, p.code, p.description || null,
        p.max_days_per_year || null, p.carry_forward_days || 0, p.requires_medical_certificate || false, p.is_active ?? true, p.color || null,
        p.leave_unit || null, p.leaves_per_period || null, p.renew_on || null,
        p.max_avail_unit || null, p.max_avail || null, p.encashment_allowed || false,
        p.marital_status_filter || null, p.gender_filter || null,
        p.entitle_on || null, p.accrual_unit || null,
        p.allow_in_probation || false, p.quota_validate || false, p.paid_leave ?? true,
        p.request_before_days || null, p.request_unit || null,
        p.late_adjustable || false, p.include_holidays || false, p.early_dep_adjustable || false
      ]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateLeaveType = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = [
      'name','code','description','max_days_per_year','carry_forward_days','requires_medical_certificate','is_active','color',
      'leave_unit','leaves_per_period','renew_on',
      'max_avail_unit','max_avail','encashment_allowed',
      'marital_status_filter','gender_filter',
      'entitle_on','accrual_unit',
      'allow_in_probation','quota_validate','paid_leave',
      'request_before_days','request_unit',
      'late_adjustable','include_holidays','early_dep_adjustable'
    ];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM leave_types WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE leave_types SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteLeaveType = async (req, res, next) => {
  try {
    await db.query('UPDATE leave_types SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Holiday Types
exports.listHolidayTypes = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 'h')(req);
    where.push('h.is_active IS DISTINCT FROM false');
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT h.* FROM holiday_types h ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createHolidayType = async (req, res, next) => {
  try {
    const p = { ...req.body };
    // Default branch from scope when available
    if (req.scope?.branchId && !p.branch_id) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.code || !p.name) return res.status(400).json({ message: 'branch_id, code, name required' });
    const { rows } = await db.query(
      `INSERT INTO holiday_types (branch_id, code, name, description, color, is_active)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,true)) RETURNING *`,
      [p.branch_id, p.code, p.name, p.description || null, p.color || null, p.is_active ?? true]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateHolidayType = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['code','name','description','color','is_active'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM holiday_types WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE holiday_types SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteHolidayType = async (req, res, next) => {
  try {
    await db.query('UPDATE holiday_types SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Calendar Holidays
exports.listCalendarHolidays = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 'ch')(req);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT ch.* FROM calendar_holidays ch ${whereSql} ORDER BY year DESC NULLS LAST, start_date ASC NULLS LAST, created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createCalendarHoliday = async (req, res, next) => {
  try {
    const p = { ...req.body };
    // Always derive branch from current scope; client should not send branch_id
    if (!req.scope?.branchId) return res.status(400).json({ message: 'Branch context missing' });
    p.branch_id = req.scope.branchId;
    if (!p.code || !p.name) return res.status(400).json({ message: 'code and name are required' });
    const { rows } = await db.query(
      `INSERT INTO calendar_holidays (branch_id, code, name, payroll_register, payroll_period, apply_on, year, period_label, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        p.branch_id,
        p.code,
        p.name,
        p.payroll_register || null,
        p.payroll_period || null,
        p.apply_on || null,
        p.year || null,
        p.period_label || null,
        p.start_date || null,
        p.end_date || null,
      ]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateCalendarHoliday = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['code','name','payroll_register','payroll_period','apply_on','year','period_label','start_date','end_date'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM calendar_holidays WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE calendar_holidays SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteCalendarHoliday = async (req, res, next) => {
  try { await db.query('DELETE FROM calendar_holidays WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// Attendance Policies
exports.listAttendancePolicies = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 'ap')(req);
    where.push('ap.is_active IS DISTINCT FROM false');
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT ap.* FROM attendance_policies ap ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createAttendancePolicy = async (req, res, next) => {
  try {
    const p = { ...req.body };
    if (req.scope?.branchId && !p.branch_id) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.code || !p.name || !p.policy_type) return res.status(400).json({ message: 'branch_id, code, name, policy_type required' });
    const { rows } = await db.query(
      `INSERT INTO attendance_policies (branch_id, code, name, policy_type, calculate_on, apply_on_off_days, description)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,false),$7) RETURNING *`,
      [p.branch_id, p.code, p.name, p.policy_type, p.calculate_on || null, p.apply_on_off_days || false, p.description || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateAttendancePolicy = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['code','name','policy_type','calculate_on','apply_on_off_days','description'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM attendance_policies WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE attendance_policies SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteAttendancePolicy = async (req, res, next) => {
  try {
    await db.query('UPDATE attendance_policies SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.listShifts = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 's')(req);
    where.push('s.is_active IS DISTINCT FROM false');
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT s.* FROM shifts s ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createShift = async (req, res, next) => {
  try {
    const p = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.name || !p.start_time || !p.end_time) return res.status(400).json({ message: 'branch_id, name, start_time, end_time required' });
    const { rows } = await db.query(`INSERT INTO shifts (branch_id, name, start_time, end_time, break_duration_minutes, is_active) VALUES ($1,$2,$3,$4,COALESCE($5,60),COALESCE($6,true)) RETURNING *`,
      [p.branch_id, p.name, p.start_time, p.end_time, p.break_duration_minutes || 60, p.is_active ?? true]);
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateShift = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['name','start_time','end_time','break_duration_minutes','is_active'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM shifts WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE shifts SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteShift = async (req, res, next) => {
  try {
    await db.query('UPDATE shifts SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.listSalaryComponents = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 'c')(req);
    where.push('c.is_active IS DISTINCT FROM false');
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT c.* FROM salary_components c ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createSalaryComponent = async (req, res, next) => {
  try {
    const p = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.name || !p.type || !p.calculation_type) return res.status(400).json({ message: 'branch_id, name, type, calculation_type required' });
    const { rows } = await db.query(
      `INSERT INTO salary_components (branch_id, name, type, calculation_type, is_taxable, is_active)
       VALUES ($1,$2,$3,$4,COALESCE($5,true),COALESCE($6,true)) RETURNING *`,
      [p.branch_id, p.name, p.type, p.calculation_type, p.is_taxable ?? true, p.is_active ?? true]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateSalaryComponent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['name','type','calculation_type','is_taxable','is_active'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM salary_components WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE salary_components SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteSalaryComponent = async (req, res, next) => {
  try {
    await db.query('UPDATE salary_components SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.listJobPostings = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    const i = { val: 1 };
    scopeBranch(where, vals, i, 'j')(req);
    where.push("(j.status IS NULL OR j.status <> 'archived')");
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT j.* FROM job_postings j ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createJobPosting = async (req, res, next) => {
  try {
    const p = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.title) return res.status(400).json({ message: 'branch_id and title required' });
    const { rows } = await db.query(
      `INSERT INTO job_postings (branch_id, title, department_id, designation_id, employment_type, vacancies, job_description, requirements, experience_required, salary_range, application_deadline, status, posted_by)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,1),$7,$8,$9,$10,$11,COALESCE($12,'open'),$13) RETURNING *`,
      [p.branch_id, p.title, p.department_id || null, p.designation_id || null, p.employment_type || null, p.vacancies || 1, p.job_description || null, p.requirements || null, p.experience_required || null, p.salary_range || null, p.application_deadline || null, p.status || 'open', p.posted_by || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateJobPosting = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['title','department_id','designation_id','employment_type','vacancies','job_description','requirements','experience_required','salary_range','application_deadline','status'];
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${idx++}`); vals.push(v); }
    }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM job_postings WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE job_postings SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteJobPosting = async (req, res, next) => {
  try {
    await db.query("UPDATE job_postings SET status = 'archived' WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Generic Lookups (dynamic dropdowns)
exports.listLookups = async (req, res, next) => {
  try {
    const category = req.params.category;
    const where = ['category = $1', 'is_active = true'];
    const vals = [category];
    let i = 2;
    if (req.scope?.branchId) {
      // Include both branch-specific and global (NULL branch_id) lookup values
      where.push('(branch_id = $' + (i++) + ' OR branch_id IS NULL)');
      vals.push(req.scope.branchId);
    }
    const whereSql = 'WHERE ' + where.join(' AND ');
    const { rows } = await db.query(`SELECT * FROM lookup_values ${whereSql} ORDER BY sort_order ASC, name ASC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createLookup = async (req, res, next) => {
  try {
    const category = req.params.category;
    const p = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.code || !p.name) return res.status(400).json({ message: 'branch_id, code, name required' });
    const { rows } = await db.query(
      `INSERT INTO lookup_values (branch_id, category, code, name, description, meta, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,0),COALESCE($8,true)) RETURNING *`,
      [p.branch_id, category, p.code, p.name, p.description || null, p.meta || null, p.sort_order || 0, p.is_active ?? true]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateLookup = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['code','name','description','meta','sort_order','is_active'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM lookup_values WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    // also bump updated_at if column exists
    sets.push(`updated_at = NOW()`);
    vals.push(id);
    const { rows } = await db.query(`UPDATE lookup_values SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteLookup = async (req, res, next) => {
  try {
    const id = req.params.id;
    await db.query('UPDATE lookup_values SET is_active = false WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};
