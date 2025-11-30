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
    if (q) { where.push(`(a.first_name ILIKE $${i} OR a.last_name ILIKE $${i} OR a.email ILIKE $${i})`); vals.push('%' + q + '%'); i++; }
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
    const allowed = ['first_name', 'last_name', 'email', 'phone', 'resume_url', 'cover_letter', 'current_company', 'current_position', 'total_experience', 'current_salary', 'expected_salary', 'application_status'];
    const sets = []; const vals = []; let i = 1;
    for (const [k, v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
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
    const allowed = ['round_number', 'round_name', 'interviewer_id', 'scheduled_date', 'actual_date', 'rating', 'feedback', 'status'];
    const sets = []; const vals = []; let i = 1;
    for (const [k, v] of Object.entries(req.body || {})) if (allowed.includes(k)) { sets.push(`${k} = $${i++}`); vals.push(v); }
    if (!sets.length) { const { rows } = await db.query('SELECT * FROM interview_rounds WHERE id = $1', [id]); return res.json({ item: rows[0] }); }
    vals.push(id);
    const { rows } = await db.query(`UPDATE interview_rounds SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ item: rows[0] });
  } catch (e) { next(e); }
};

exports.deleteInterview = async (req, res, next) => {
  try { await db.query('DELETE FROM interview_rounds WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (e) { next(e); }
};

// ============================================================================
// ENHANCED RECRUITMENT WORKFLOW
// ============================================================================

// Job Applications
exports.createJobApplication = async (req, res, next) => {
  try {
    const { jobPostingId, applicantId, source, referrerEmployeeId, resumeUrl, coverLetter, portfolioUrl } = req.body;
    const { branchId } = req.user;

    const result = await db.query(
      `INSERT INTO job_applications (
        job_posting_id, applicant_id, source, referrer_employee_id, 
        resume_url, cover_letter, portfolio_url, branch_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [jobPostingId, applicantId, source, referrerEmployeeId, resumeUrl, coverLetter, portfolioUrl, branchId]
    );

    // Log stage history
    await db.query(
      `INSERT INTO application_stage_history (application_id, to_stage, changed_by)
      VALUES ($1, 'APPLIED', $2)`,
      [result.rows[0].id, req.user.userId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.listJobApplications = async (req, res, next) => {
  try {
    const { jobPostingId, currentStage, status } = req.query;
    const { branchId } = req.user;

    let query = `
      SELECT 
        ja.*,
        a.first_name || ' ' || a.last_name as applicant_name,
        a.email as applicant_email,
        a.phone as applicant_phone,
        jp.title as job_title
      FROM job_applications ja
      LEFT JOIN applicants a ON ja.applicant_id = a.id
      LEFT JOIN job_postings jp ON ja.job_posting_id = jp.id
      WHERE ja.branch_id = $1
    `;

    const params = [branchId];
    let paramCount = 1;

    if (jobPostingId) {
      paramCount++;
      query += ` AND ja.job_posting_id = $${paramCount}`;
      params.push(jobPostingId);
    }

    if (currentStage) {
      paramCount++;
      query += ` AND ja.current_stage = $${paramCount}`;
      params.push(currentStage);
    }

    if (status) {
      paramCount++;
      query += ` AND ja.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY ja.application_date DESC`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;
    const { branchId, userId } = req.user;

    // Get current stage
    const currentApp = await db.query(
      'SELECT current_stage FROM job_applications WHERE id = $1 AND branch_id = $2',
      [id, branchId]
    );

    if (currentApp.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const fromStage = currentApp.rows[0].current_stage;

    // Update application
    const result = await db.query(
      `UPDATE job_applications SET
        current_stage = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND branch_id = $3
      RETURNING *`,
      [stage, id, branchId]
    );

    // Log stage history
    await db.query(
      `INSERT INTO application_stage_history (application_id, from_stage, to_stage, changed_by, notes)
      VALUES ($1, $2, $3, $4, $5)`,
      [id, fromStage, stage, userId, notes]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Interview Scheduling with Panels
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, interviewType, interviewRound, scheduledDate, durationMinutes, location, meetingLink, panelMembers } = req.body;
    const { userId } = req.user;

    // Create interview
    const interviewResult = await db.query(
      `INSERT INTO interviews (
        application_id, interview_type, interview_round, scheduled_date, 
        duration_minutes, location, meeting_link, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'SCHEDULED', $8)
      RETURNING *`,
      [applicationId, interviewType, interviewRound, scheduledDate, durationMinutes, location, meetingLink, userId]
    );

    const interviewId = interviewResult.rows[0].id;

    // Add panel members
    if (panelMembers && Array.isArray(panelMembers)) {
      for (const member of panelMembers) {
        await db.query(
          `INSERT INTO interview_panels (interview_id, panel_member_id, role)
          VALUES ($1, $2, $3)`,
          [interviewId, member.employeeId, member.role || 'INTERVIEWER']
        );
      }
    }

    res.status(201).json({ success: true, data: interviewResult.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.submitInterviewFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      panelMemberId, applicationId, technicalSkillsRating, technicalSkillsComments,
      communicationRating, problemSolvingRating, teamworkRating, leadershipRating,
      overallRating, strengths, weaknesses, overallComments, recommendation
    } = req.body;

    const result = await db.query(
      `INSERT INTO interview_feedback (
        interview_id, panel_member_id, application_id,
        technical_skills_rating, technical_skills_comments,
        communication_rating, problem_solving_rating, teamwork_rating, leadership_rating,
        overall_rating, strengths, weaknesses, overall_comments, recommendation,
        status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'SUBMITTED', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        id, panelMemberId, applicationId,
        technicalSkillsRating, technicalSkillsComments,
        communicationRating, problemSolvingRating, teamworkRating, leadershipRating,
        overallRating, strengths, weaknesses, overallComments, recommendation
      ]
    );

    // Update panel member feedback status
    await db.query(
      `UPDATE interview_panels SET
        feedback_submitted = TRUE,
        feedback_submitted_at = CURRENT_TIMESTAMP
      WHERE interview_id = $1 AND panel_member_id = $2`,
      [id, panelMemberId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Offer Letter Management
exports.generateOfferLetter = async (req, res, next) => {
  try {
    const {
      applicationId, jobPostingId, applicantId, designationId, departmentId,
      offeredSalary, currency, salaryFrequency, benefits, allowances, bonusStructure,
      employmentType, probationPeriodMonths, noticePeriodDays, joiningDate, offerValidUntil
    } = req.body;
    const { branchId, userId } = req.user;

    const result = await db.query(
      `INSERT INTO offer_letters (
        application_id, job_posting_id, applicant_id, designation_id, department_id,
        offered_salary, currency, salary_frequency, benefits, allowances, bonus_structure,
        employment_type, probation_period_months, notice_period_days, joining_date, offer_valid_until,
        branch_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        applicationId, jobPostingId, applicantId, designationId, departmentId,
        offeredSalary, currency, salaryFrequency, benefits, allowances, bonusStructure,
        employmentType, probationPeriodMonths, noticePeriodDays, joiningDate, offerValidUntil,
        branchId, userId
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateOfferStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, candidateResponse, candidateComments } = req.body;
    const { branchId } = req.user;

    const result = await db.query(
      `UPDATE offer_letters SET
        status = $1,
        candidate_response = COALESCE($2, candidate_response),
        candidate_comments = COALESCE($3, candidate_comments),
        response_received_at = CASE WHEN $2 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE response_received_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND branch_id = $5
      RETURNING *`,
      [status, candidateResponse, candidateComments, id, branchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer letter not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.listOfferLetters = async (req, res, next) => {
  try {
    const { status, applicantId } = req.query;
    const { branchId } = req.user;

    let query = `
      SELECT 
        ol.*,
        a.first_name || ' ' || a.last_name as applicant_name,
        jp.title as job_title,
        d.name as designation_name,
        dept.name as department_name
      FROM offer_letters ol
      LEFT JOIN applicants a ON ol.applicant_id = a.id
      LEFT JOIN job_postings jp ON ol.job_posting_id = jp.id
      LEFT JOIN designations d ON ol.designation_id = d.id
      LEFT JOIN departments dept ON ol.department_id = dept.id
      WHERE ol.branch_id = $1
    `;

    const params = [branchId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND ol.status = $${paramCount}`;
      params.push(status);
    }

    if (applicantId) {
      paramCount++;
      query += ` AND ol.applicant_id = $${paramCount}`;
      params.push(applicantId);
    }

    query += ` ORDER BY ol.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Candidate Communications
exports.logCommunication = async (req, res, next) => {
  try {
    const { applicationId, communicationType, subject, message, direction, sentTo, attachments } = req.body;
    const { userId } = req.user;

    const result = await db.query(
      `INSERT INTO candidate_communications (
        application_id, communication_type, subject, message, direction, sent_by, sent_to, attachments, status, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SENT', CURRENT_TIMESTAMP)
      RETURNING *`,
      [applicationId, communicationType, subject, message, direction, userId, sentTo, JSON.stringify(attachments)]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.listCommunications = async (req, res, next) => {
  try {
    const { applicationId } = req.query;

    const result = await db.query(
      `SELECT cc.*, u.name as sent_by_name
      FROM candidate_communications cc
      LEFT JOIN users u ON cc.sent_by = u.id
      WHERE cc.application_id = $1
      ORDER BY cc.sent_at DESC`,
      [applicationId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

