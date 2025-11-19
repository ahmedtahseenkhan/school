const db = require('../../utils/database/connection');

// Applicants
exports.listApplicants = async (req, res, next) => {
  try {
    const { job_posting_id, status, q } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (job_posting_id) { where.push(`a.job_posting_id = $${i++}`); vals.push(job_posting_id); }
    if (status) { where.push(`a.application_status = $${i++}`); vals.push(status); }
    if (q) { where.push(`(a.first_name ILIKE $${i} OR a.last_name ILIKE $${i} OR a.email ILIKE $${i})`); vals.push('%'+q+'%'); i++; }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT a.* FROM job_applicants a ${whereSql} ORDER BY a.applied_date DESC LIMIT 500`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createApplicant = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.job_posting_id || !p.first_name || !p.last_name || !p.email) return res.status(400).json({ message: 'job_posting_id, first_name, last_name, email required' });
    const { rows } = await db.query(
      `INSERT INTO job_applicants (job_posting_id, first_name, last_name, email, phone, resume_url, cover_letter, current_company, current_position, total_experience, current_salary, expected_salary, application_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13,'applied')) RETURNING *`,
      [p.job_posting_id, p.first_name, p.last_name, p.email, p.phone || null, p.resume_url || null, p.cover_letter || null, p.current_company || null, p.current_position || null, p.total_experience || null, p.current_salary || null, p.expected_salary || null, p.application_status || 'applied']
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateApplicant = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['first_name','last_name','email','phone','resume_url','cover_letter','current_company','current_position','total_experience','current_salary','expected_salary','application_status'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM job_applicants WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE job_applicants SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteApplicant = async (req, res, next) => {
  try { await db.query('DELETE FROM job_applicants WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// Interviews
exports.listInterviews = async (req, res, next) => {
  try {
    const { applicant_id, status } = req.query;
    const where = []; const vals = []; let i = 1;
    if (applicant_id) { where.push(`ir.applicant_id = $${i++}`); vals.push(applicant_id); }
    if (status) { where.push(`ir.status = $${i++}`); vals.push(status); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT ir.* FROM interview_rounds ir ${whereSql} ORDER BY ir.round_number ASC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createInterview = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.applicant_id || !p.round_number) return res.status(400).json({ message: 'applicant_id, round_number required' });
    const { rows } = await db.query(
      `INSERT INTO interview_rounds (applicant_id, round_number, round_name, interviewer_id, scheduled_date, rating, feedback, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,'scheduled')) RETURNING *`,
      [p.applicant_id, p.round_number, p.round_name || null, p.interviewer_id || null, p.scheduled_date || null, p.rating || null, p.feedback || null, p.status || 'scheduled']
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateInterview = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['round_number','round_name','interviewer_id','scheduled_date','actual_date','rating','feedback','status'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM interview_rounds WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE interview_rounds SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteInterview = async (req, res, next) => {
  try { await db.query('DELETE FROM interview_rounds WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};
