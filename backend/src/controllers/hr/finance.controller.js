const db = require('../../utils/database/connection');

// Loans
exports.listLoans = async (req, res, next) => {
  try {
    const { employee_id, status } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (employee_id) { where.push(`l.employee_id = $${i++}`); vals.push(employee_id); }
    if (status) { where.push(`l.status = $${i++}`); vals.push(status); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT
         l.*,
         e.employee_id AS employee_code,
         e.first_name,
         e.last_name
       FROM employee_loans l
       LEFT JOIN employees e ON e.id = l.employee_id
       ${whereSql}
       ORDER BY l.created_at DESC`,
      vals
    );
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createLoan = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.employee_id || !p.loan_type || !p.loan_amount || !p.tenure_months || !p.start_date) return res.status(400).json({ message: 'employee_id, loan_type, loan_amount, tenure_months, start_date required' });
    const { rows } = await db.query(
      `INSERT INTO employee_loans (employee_id, loan_type, loan_amount, interest_rate, tenure_months, start_date, emi_amount, remaining_amount, status, approved_by)
       VALUES ($1,$2,$3,COALESCE($4,0),$5,$6,$7,$8,COALESCE($9,'active'),$10) RETURNING *`,
      [p.employee_id, p.loan_type, p.loan_amount, p.interest_rate || 0, p.tenure_months, p.start_date, p.emi_amount || null, p.remaining_amount || null, p.status || 'active', p.approved_by || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateLoan = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['loan_type','loan_amount','interest_rate','tenure_months','start_date','emi_amount','remaining_amount','status','approved_by'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM employee_loans WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE employee_loans SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteLoan = async (req, res, next) => {
  try { await db.query('DELETE FROM employee_loans WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// Loan Repayments
exports.listRepayments = async (req, res, next) => {
  try {
    const { loan_id } = req.query;
    const where = [];
    const vals = [];
    let i = 1;
    if (loan_id) { where.push(`lr.loan_id = $${i++}`); vals.push(loan_id); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT lr.* FROM loan_repayments lr ${whereSql} ORDER BY lr.payment_date DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createRepayment = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.loan_id || !p.payment_date || !p.amount) return res.status(400).json({ message: 'loan_id, payment_date, amount required' });
    const { rows } = await db.query(
      `INSERT INTO loan_repayments (loan_id, payment_date, amount, principal_amount, interest_amount, remaining_balance, status)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'paid')) RETURNING *`,
      [p.loan_id, p.payment_date, p.amount, p.principal_amount || null, p.interest_amount || null, p.remaining_balance || null, p.status || 'paid']
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateRepayment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['payment_date','amount','principal_amount','interest_amount','remaining_balance','status'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM loan_repayments WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE loan_repayments SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteRepayment = async (req, res, next) => {
  try { await db.query('DELETE FROM loan_repayments WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// Reimbursements
exports.listReimbursements = async (req, res, next) => {
  try {
    const { employee_id, status } = req.query;
    const where = []; const vals = []; let i = 1;
    if (employee_id) { where.push(`rc.employee_id = $${i++}`); vals.push(employee_id); }
    if (status) { where.push(`rc.status = $${i++}`); vals.push(status); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT rc.* FROM reimbursement_claims rc ${whereSql} ORDER BY rc.claim_date DESC`, vals);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

exports.createReimbursement = async (req, res, next) => {
  try {
    const p = req.body || {};
    if (!p.employee_id || !p.claim_type || !p.claim_date || !p.amount) return res.status(400).json({ message: 'employee_id, claim_type, claim_date, amount required' });
    const { rows } = await db.query(
      `INSERT INTO reimbursement_claims (employee_id, claim_type, claim_date, amount, description, document_url, status, approved_by, approved_at, paid_date)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'pending'),$8,$9,$10) RETURNING *`,
      [p.employee_id, p.claim_type, p.claim_date, p.amount, p.description || null, p.document_url || null, p.status || 'pending', p.approved_by || null, p.approved_at || null, p.paid_date || null]
    );
    res.status(201).json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.updateReimbursement = async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowed = ['claim_type','claim_date','amount','description','document_url','status','approved_by','approved_at','paid_date'];
    const sets = []; const vals = []; let i = 1;
    for (const [k,v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM reimbursement_claims WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE reimbursement_claims SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteReimbursement = async (req, res, next) => {
  try { await db.query('DELETE FROM reimbursement_claims WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};
