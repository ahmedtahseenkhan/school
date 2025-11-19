const db = require('../../utils/database/connection');

exports.getEmployees = async (req, res, next) => {
  try {
    const { department_id, designation_id, status, q } = req.query;
    const where = [];
    const values = [];
    let i = 1;
    if (req.scope?.branchId) { where.push(`e.branch_id = $${i++}`); values.push(req.scope.branchId); }
    if (department_id) { where.push(`e.department_id = $${i++}`); values.push(department_id); }
    if (designation_id) { where.push(`e.designation_id = $${i++}`); values.push(designation_id); }
    if (status) { where.push(`e.employment_status = $${i++}`); values.push(status); }
    if (q) { where.push(`(e.first_name ILIKE $${i} OR e.last_name ILIKE $${i} OR e.employee_id ILIKE $${i})`); values.push(`%${q}%`); i++; }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `
      SELECT e.id, e.employee_id, e.first_name, e.last_name, e.employment_status, e.branch_id,
             d.name AS department, g.title AS designation
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN designations g ON g.id = e.designation_id
      ${whereSql}
      ORDER BY e.created_at DESC
      LIMIT 200
    `;
    const { rows } = await db.query(sql, values);
    res.json({ employees: rows });
  } catch (e) { next(e); }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { rows } = await db.query('SELECT branch_id FROM employees WHERE id = $1', [id]);
    const emp = rows[0];
    if (!emp) return res.status(404).json({ message: 'Not found' });
    if (req.scope?.branchId && emp.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await db.query('DELETE FROM employees WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    // Always default branch_id from branch scope when present and not explicitly provided
    if (req.scope?.branchId && !payload.branch_id) {
      payload.branch_id = req.scope.branchId;
    }
    // Normalize empty strings to null so optional UUID/text fields don't break (e.g. "" for UUID)
    for (const [k, v] of Object.entries(payload)) {
      if (v === '') payload[k] = null;
    }
    const required = ['branch_id','employee_id','first_name','last_name','joining_date'];
    for (const f of required) {
      if (!payload[f]) return res.status(400).json({ message: `Missing required field: ${f}` });
    }
    const fields = [
      'branch_id','employee_id','user_id','department_id','designation_id','reporting_manager_id',
      'first_name','last_name','title','date_of_birth','gender','marital_status','blood_group','national_id',
      'personal_email','personal_phone','alternate_phone','address_line1','address_line2','city','state','postal_code','country','nationality',
      'employment_type','employee_category','joining_date','confirmation_date','termination_date','contract_end_date','employment_status','probation_period_months',
      'work_email','work_phone','work_location','desk_number','notes',
      'bank_name','bank_account_number','bank_account_type','bank_branch','bank_ifsc_code','bank_micr_code',
      'pf_number','uan_number','esi_number','pan_number','tax_deduction_section','declared_investments','payment_method','payment_frequency',
      'health_insurance_provider','health_insurance_number','health_insurance_expiry','photo_url',
      'grade_band'
    ];
    const insertCols = [];
    const insertVals = [];
    const params = [];
    let i = 1;
    for (const k of fields) {
      if (payload[k] !== undefined) {
        insertCols.push(k);
        params.push(`$${i++}`);
        insertVals.push(payload[k]);
      }
    }
    const sql = `INSERT INTO employees (${insertCols.join(',')}) VALUES (${params.join(',')})
                 RETURNING id, employee_id, first_name, last_name, branch_id`;
    const { rows } = await db.query(sql, insertVals);
    res.status(201).json({ employee: rows[0] });
  } catch (e) { next(e); }
};

exports.getEmployeeProfile = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { rows } = await db.query(
      `SELECT e.*, d.name AS department, g.title AS designation,
              rm.first_name AS manager_first_name, rm.last_name AS manager_last_name
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN designations g ON g.id = e.designation_id
       LEFT JOIN employees rm ON rm.id = e.reporting_manager_id
       WHERE e.id = $1`, [id]
    );
    const employee = rows[0];
    if (!employee) return res.status(404).json({ message: 'Not found' });
    if (req.scope?.branchId && employee.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Load arrays
    const [contacts, quals, skills, docs, history] = await Promise.all([
      db.query('SELECT * FROM employee_emergency_contacts WHERE employee_id = $1 ORDER BY is_primary DESC, created_at DESC', [id]),
      db.query('SELECT * FROM employee_qualifications WHERE employee_id = $1 ORDER BY year_of_passing DESC, created_at DESC', [id]),
      db.query('SELECT * FROM employee_skills WHERE employee_id = $1 ORDER BY created_at DESC', [id]),
      db.query('SELECT * FROM employee_documents WHERE employee_id = $1 ORDER BY upload_date DESC', [id]),
      db.query('SELECT * FROM employment_history WHERE employee_id = $1 ORDER BY start_date DESC NULLS LAST, created_at DESC', [id])
    ]);
    res.json({ employee: { ...employee, emergency_contacts: contacts.rows, qualifications: quals.rows, skills: skills.rows, documents: docs.rows, employment_history: history.rows } });
  } catch (e) { next(e); }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = [
      'department_id','designation_id','reporting_manager_id',
      'first_name','last_name','title','date_of_birth','gender','marital_status','blood_group','national_id',
      'personal_email','personal_phone','alternate_phone','address_line1','address_line2','city','state','postal_code','country','nationality',
      'employment_type','employee_category','confirmation_date','termination_date','contract_end_date','employment_status','probation_period_months',
      'work_email','work_phone','work_location','desk_number','notes',
      'bank_name','bank_account_number','bank_account_type','bank_branch','bank_ifsc_code','bank_micr_code',
      'pf_number','uan_number','esi_number','pan_number','tax_deduction_section','declared_investments','payment_method','payment_frequency',
      'health_insurance_provider','health_insurance_number','health_insurance_expiry','photo_url',
      'grade_band'
    ];
    const sets = [];
    const vals = [];
    let i = 1;
    for (const [k, v] of Object.entries(req.body || {})) {
      if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    }
    if (!sets.length) {
      const { rows } = await db.query('SELECT id, employee_id, first_name, last_name FROM employees WHERE id = $1', [id]);
      return res.json({ employee: rows[0] });
    }
    vals.push(id);
    const sql = `UPDATE employees SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i}
                 RETURNING id, employee_id, first_name, last_name, branch_id`;
    const { rows } = await db.query(sql, vals);
    res.json({ employee: rows[0] });
  } catch (e) { next(e); }
};

exports.uploadEmployeePhoto = async (req, res, next) => {
  try {
    // Placeholder: integrate with file upload service later
    res.status(501).json({ message: 'Not implemented' });
  } catch (e) { next(e); }
};

// Emergency Contacts CRUD
exports.listEmergencyContacts = async (req, res, next) => {
  try { const { rows } = await db.query('SELECT * FROM employee_emergency_contacts WHERE employee_id = $1 ORDER BY is_primary DESC, created_at DESC', [req.params.id]); res.json({ items: rows }); } catch (e) { next(e); }
};
exports.createEmergencyContact = async (req, res, next) => {
  try {
    const e = req.body || {};
    if (!e.name || !e.phone) return res.status(400).json({ message: 'name and phone required' });
    const { rows } = await db.query(
      `INSERT INTO employee_emergency_contacts (employee_id, name, relationship, phone, email, address, is_primary)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,false)) RETURNING *`,
      [req.params.id, e.name, e.relationship || null, e.phone, e.email || null, e.address || null, e.is_primary || false]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.updateEmergencyContact = async (req, res, next) => {
  try {
    const id = req.params.contactId;
    const allowed = ['name','relationship','phone','email','address','is_primary'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employee_emergency_contacts WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE employee_emergency_contacts SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.deleteEmergencyContact = async (req, res, next) => {
  try { await db.query('DELETE FROM employee_emergency_contacts WHERE id = $1', [req.params.contactId]); res.json({ success: true }); } catch (e) { next(e); }
};

// Qualifications CRUD
exports.listQualifications = async (req, res, next) => {
  try { const { rows } = await db.query('SELECT * FROM employee_qualifications WHERE employee_id = $1 ORDER BY year_of_passing DESC, created_at DESC', [req.params.id]); res.json({ items: rows }); } catch (e) { next(e); }
};
exports.createQualification = async (req, res, next) => {
  try {
    const q = req.body || {};
    if (!q.qualification_type || !q.qualification_name) return res.status(400).json({ message: 'qualification_type and qualification_name required' });
    const { rows } = await db.query(
      `INSERT INTO employee_qualifications (employee_id, qualification_type, qualification_name, institution, year_of_passing, percentage, board_university, grade, specialization, document_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.params.id, q.qualification_type, q.qualification_name, q.institution || null, q.year_of_passing || null, q.percentage || null, q.board_university || null, q.grade || null, q.specialization || null, q.document_url || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.updateQualification = async (req, res, next) => {
  try {
    const id = req.params.qualId;
    const allowed = ['qualification_type','qualification_name','institution','year_of_passing','percentage','board_university','grade','specialization','document_url'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employee_qualifications WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE employee_qualifications SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.deleteQualification = async (req, res, next) => {
  try { await db.query('DELETE FROM employee_qualifications WHERE id = $1', [req.params.qualId]); res.json({ success: true }); } catch (e) { next(e); }
};

// Skills CRUD
exports.listSkills = async (req, res, next) => {
  try { const { rows } = await db.query('SELECT * FROM employee_skills WHERE employee_id = $1 ORDER BY created_at DESC', [req.params.id]); res.json({ items: rows }); } catch (e) { next(e); }
};
exports.createSkill = async (req, res, next) => {
  try {
    const s = req.body || {};
    if (!s.skill_type || !s.skill_name) return res.status(400).json({ message: 'skill_type and skill_name required' });
    const { rows } = await db.query(
      `INSERT INTO employee_skills (employee_id, skill_type, skill_name, skill_rating, proficiency_level, years_of_experience, last_used, certification)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.id, s.skill_type, s.skill_name, s.skill_rating || null, s.proficiency_level || null, s.years_of_experience || null, s.last_used || null, s.certification || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.updateSkill = async (req, res, next) => {
  try {
    const id = req.params.skillId;
    const allowed = ['skill_type','skill_name','skill_rating','proficiency_level','years_of_experience','last_used','certification'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employee_skills WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE employee_skills SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.deleteSkill = async (req, res, next) => {
  try { await db.query('DELETE FROM employee_skills WHERE id = $1', [req.params.skillId]); res.json({ success: true }); } catch (e) { next(e); }
};

// Documents CRUD
exports.listDocuments = async (req, res, next) => {
  try { const { rows } = await db.query('SELECT * FROM employee_documents WHERE employee_id = $1 ORDER BY upload_date DESC', [req.params.id]); res.json({ items: rows }); } catch (e) { next(e); }
};
exports.createDocument = async (req, res, next) => {
  try {
    const d = req.body || {};
    if (!d.document_type || !d.document_name || !d.file_url) return res.status(400).json({ message: 'document_type, document_name, file_url required' });
    const { rows } = await db.query(
      `INSERT INTO employee_documents (employee_id, document_type, document_name, file_url, issue_date, expiry_date, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, d.document_type, d.document_name, d.file_url, d.issue_date || null, d.expiry_date || null, d.description || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.updateDocument = async (req, res, next) => {
  try {
    const id = req.params.docId;
    const allowed = ['document_type','document_name','file_url','issue_date','expiry_date','description'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employee_documents WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE employee_documents SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.deleteDocument = async (req, res, next) => {
  try { await db.query('DELETE FROM employee_documents WHERE id = $1', [req.params.docId]); res.json({ success: true }); } catch (e) { next(e); }
};

// Employment History CRUD
exports.listEmploymentHistory = async (req, res, next) => {
  try { const { rows } = await db.query('SELECT * FROM employment_history WHERE employee_id = $1 ORDER BY start_date DESC NULLS LAST, created_at DESC', [req.params.id]); res.json({ items: rows }); } catch (e) { next(e); }
};
exports.createEmploymentHistory = async (req, res, next) => {
  try {
    const h = req.body || {};
    if (!h.company_name) return res.status(400).json({ message: 'company_name required' });
    const { rows } = await db.query(
      `INSERT INTO employment_history (employee_id, company_name, position, start_date, end_date, responsibilities, reference_contact)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, h.company_name, h.position || null, h.start_date || null, h.end_date || null, h.responsibilities || null, h.reference_contact || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.updateEmploymentHistory = async (req, res, next) => {
  try {
    const id = req.params.histId;
    const allowed = ['company_name','position','start_date','end_date','responsibilities','reference_contact'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employment_history WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE employment_history SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};
exports.deleteEmploymentHistory = async (req, res, next) => {
  try { await db.query('DELETE FROM employment_history WHERE id = $1', [req.params.histId]); res.json({ success: true }); } catch (e) { next(e); }
};

exports.listTransfers = async (req, res, next) => {
  try {
    const { employee_id, status } = req.query || {};
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`t.employee_id = $${i++}`); vals.push(employee_id); }
    if (status) { where.push(`t.status = $${i++}`); vals.push(status); }
    if (req.scope?.branchId) {
      where.push(`(e.branch_id = $${i} OR t.from_branch_id = $${i} OR t.to_branch_id = $${i})`);
      vals.push(req.scope.branchId);
      i += 1;
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT
         t.*,
         e.employee_id,
         e.first_name,
         e.last_name,
         fb.name AS from_branch_name,
         tb.name AS to_branch_name,
         fd.name AS from_department_name,
         td.name AS to_department_name,
         fdes.title AS from_designation_name,
         tdes.title AS to_designation_name
       FROM employee_transfers t
       JOIN employees e ON e.id = t.employee_id
       LEFT JOIN branches fb ON fb.id = t.from_branch_id
       LEFT JOIN branches tb ON tb.id = t.to_branch_id
       LEFT JOIN departments fd ON fd.id = t.from_department_id
       LEFT JOIN departments td ON td.id = t.to_department_id
       LEFT JOIN designations fdes ON fdes.id = t.from_designation_id
       LEFT JOIN designations tdes ON tdes.id = t.to_designation_id
       ${whereSql}
       ORDER BY t.created_at DESC
       LIMIT 200`,
      vals
    );
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createTransfer = async (req, res, next) => {
  try {
    const p = req.body || {};
    const { employee_id, to_department_id, to_designation_id, effective_date, reason } = p;
    if (!employee_id || !to_department_id || !effective_date) {
      return res.status(400).json({ message: 'employee_id, to_department_id, effective_date required' });
    }
    const { rows: empRows } = await db.query('SELECT id, branch_id, department_id, designation_id FROM employees WHERE id = $1', [employee_id]);
    const emp = empRows[0];
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    if (req.scope?.branchId && emp.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { rows } = await db.query(
      `INSERT INTO employee_transfers (
         employee_id, from_branch_id, to_branch_id,
         from_department_id, to_department_id,
         from_designation_id, to_designation_id,
         effective_date, reason, status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *`,
      [
        employee_id,
        emp.branch_id,
        emp.branch_id,
        emp.department_id || null,
        to_department_id,
        emp.designation_id || null,
        to_designation_id || null,
        effective_date,
        reason || null
      ]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateTransfer = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status, approval_comment } = req.body || {};
    const allowed = ['pending','approved','rejected','cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: 'Valid status required' });
    }
    const { rows: tRows } = await db.query('SELECT * FROM employee_transfers WHERE id = $1', [id]);
    const t = tRows[0];
    if (!t) return res.status(404).json({ message: 'Transfer not found' });

    const { rows: empRows } = await db.query('SELECT id, branch_id FROM employees WHERE id = $1', [t.employee_id]);
    const emp = empRows[0];
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    if (req.scope?.branchId && emp.branch_id !== req.scope.branchId && !['super_admin','admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await db.query('BEGIN');
    try {
      if (t.status === 'pending' && status === 'approved') {
        await db.query(
          `UPDATE employees
             SET department_id = COALESCE($1, department_id),
                 designation_id = COALESCE($2, designation_id),
                 updated_at = NOW()
           WHERE id = $3`,
          [t.to_department_id || null, t.to_designation_id || null, t.employee_id]
        );
      }
      const { rows } = await db.query(
        `UPDATE employee_transfers
           SET status = $1,
               approval_comment = COALESCE($2, approval_comment),
               approved_by = $3,
               approved_at = CASE WHEN $1 IN ('approved','rejected','cancelled') THEN NOW() ELSE approved_at END
         WHERE id = $4
         RETURNING *`,
        [status, approval_comment || null, req.user?.id || null, id]
      );
      await db.query('COMMIT');
      res.json({ item: rows[0] });
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (e) { next(e); }
};
