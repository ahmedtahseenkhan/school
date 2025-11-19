const db = require('../../utils/database/connection');

// Onboarding Templates
exports.listTemplates = async (req, res, next) => {
  try {
    const where = [];
    const vals = [];
    let i = 1;
    if (req.scope?.branchId) { where.push(`ot.branch_id = $${i++}`); vals.push(req.scope.branchId); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT ot.* FROM onboarding_templates ot ${whereSql} ORDER BY created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const p = { ...req.body };
    if (req.scope?.branchId && !['super_admin','admin'].includes(req.user.role)) p.branch_id = req.scope.branchId;
    if (!p.branch_id || !p.name) return res.status(400).json({ message: 'branch_id and name required' });
    const { rows } = await db.query(`INSERT INTO onboarding_templates (branch_id, name, description, for_designation_id, is_active) VALUES ($1,$2,$3,$4,COALESCE($5,true)) RETURNING *`,
      [p.branch_id, p.name, p.description || null, p.for_designation_id || null, p.is_active ?? true]);
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['name','description','for_designation_id','is_active'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM onboarding_templates WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE onboarding_templates SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteTemplate = async (req, res, next) => {
  try { await db.query('DELETE FROM onboarding_templates WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// Onboarding Tasks
exports.listTasks = async (req, res, next) => {
  try {
    const { template_id } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (template_id) { where.push(`t.template_id = $${i++}`); vals.push(template_id); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT t.* FROM onboarding_tasks t ${whereSql} ORDER BY task_order NULLS LAST, created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createTask = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.template_id || !p.task_name) return res.status(400).json({ message: 'template_id and task_name required' });
    const { rows } = await db.query(
      `INSERT INTO onboarding_tasks (template_id, task_name, description, assigned_to_role, deadline_days, is_mandatory, task_order)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6,true),$7) RETURNING *`,
      [p.template_id, p.task_name, p.description || null, p.assigned_to_role || null, p.deadline_days || null, p.is_mandatory ?? true, p.task_order || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['task_name','description','assigned_to_role','deadline_days','is_mandatory','task_order'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM onboarding_tasks WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE onboarding_tasks SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteTask = async (req, res, next) => {
  try { await db.query('DELETE FROM onboarding_tasks WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// Employee Onboarding
exports.listEmployeeOnboarding = async (req, res, next) => {
  try {
    const { employee_id, status } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`eo.employee_id = $${i++}`); vals.push(employee_id); }
    if (status) { where.push(`eo.status = $${i++}`); vals.push(status); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT eo.* FROM employee_onboarding eo ${whereSql} ORDER BY eo.created_at DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createEmployeeOnboarding = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.employee_id || !p.task_id) return res.status(400).json({ message: 'employee_id and task_id required' });
    const { rows } = await db.query(
      `INSERT INTO employee_onboarding (employee_id, task_id, assigned_to, status, completed_date, notes)
       VALUES ($1,$2,$3,COALESCE($4,'pending'),$5,$6) RETURNING *`,
      [p.employee_id, p.task_id, p.assigned_to || null, p.status || 'pending', p.completed_date || null, p.notes || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateEmployeeOnboarding = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['assigned_to','status','completed_date','notes'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employee_onboarding WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE employee_onboarding SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteEmployeeOnboarding = async (req, res, next) => {
  try { await db.query('DELETE FROM employee_onboarding WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};
