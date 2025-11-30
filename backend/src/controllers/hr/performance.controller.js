const db = require('../../utils/database/connection');

// ============================================================================
// PERFORMANCE GOALS
// ============================================================================

async function listGoals(req, res, next) {
    try {
        const { employeeId, status, appraisalCycleId, managerId } = req.query;
        const { branchId } = req.user;

        let query = `
      SELECT 
        pg.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.employee_code,
        m.first_name || ' ' || e.last_name as manager_name,
        ac.name as appraisal_cycle_name
      FROM performance_goals pg
      LEFT JOIN employees e ON pg.employee_id = e.id
      LEFT JOIN employees m ON pg.manager_id = m.id
      LEFT JOIN appraisal_cycles ac ON pg.appraisal_cycle_id = ac.id
      WHERE pg.branch_id = $1
    `;

        const params = [branchId];
        let paramCount = 1;

        if (employeeId) {
            paramCount++;
            query += ` AND pg.employee_id = $${paramCount}`;
            params.push(employeeId);
        }

        if (status) {
            paramCount++;
            query += ` AND pg.status = $${paramCount}`;
            params.push(status);
        }

        if (appraisalCycleId) {
            paramCount++;
            query += ` AND pg.appraisal_cycle_id = $${paramCount}`;
            params.push(appraisalCycleId);
        }

        if (managerId) {
            paramCount++;
            query += ` AND pg.manager_id = $${paramCount}`;
            params.push(managerId);
        }

        query += ` ORDER BY pg.created_at DESC`;

        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
}

async function createGoal(req, res, next) {
    try {
        const {
            employeeId, title, description, specific, measurable, achievable,
            relevant, timeBound, category, priority, targetValue, unit,
            appraisalCycleId, parentGoalId, managerId
        } = req.body;
        const { branchId, userId } = req.user;

        const result = await db.query(
            `INSERT INTO performance_goals (
        employee_id, title, description, specific, measurable, achievable,
        relevant, time_bound, category, priority, target_value, unit,
        appraisal_cycle_id, parent_goal_id, manager_id, branch_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
            [
                employeeId, title, description, specific, measurable, achievable,
                relevant, timeBound, category, priority, targetValue, unit,
                appraisalCycleId, parentGoalId, managerId, branchId, userId
            ]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function updateGoal(req, res, next) {
    try {
        const { id } = req.params;
        const {
            title, description, specific, measurable, achievable, relevant,
            timeBound, category, priority, targetValue, unit, status
        } = req.body;
        const { branchId } = req.user;

        const result = await db.query(
            `UPDATE performance_goals SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        specific = COALESCE($3, specific),
        measurable = COALESCE($4, measurable),
        achievable = COALESCE($5, achievable),
        relevant = COALESCE($6, relevant),
        time_bound = COALESCE($7, time_bound),
        category = COALESCE($8, category),
        priority = COALESCE($9, priority),
        target_value = COALESCE($10, target_value),
        unit = COALESCE($11, unit),
        status = COALESCE($12, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 AND branch_id = $14
      RETURNING *`,
            [
                title, description, specific, measurable, achievable, relevant,
                timeBound, category, priority, targetValue, unit, status, id, branchId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function updateGoalProgress(req, res, next) {
    try {
        const { id } = req.params;
        const { currentValue, progress, notes } = req.body;
        const { branchId, userId } = req.user;

        // Get previous value
        const goalResult = await db.query(
            'SELECT current_value, progress FROM performance_goals WHERE id = $1 AND branch_id = $2',
            [id, branchId]
        );

        if (goalResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        const previousValue = goalResult.rows[0].current_value;
        const previousProgress = goalResult.rows[0].progress;

        // Update goal
        const result = await db.query(
            `UPDATE performance_goals SET
        current_value = COALESCE($1, current_value),
        progress = COALESCE($2, progress),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND branch_id = $4
      RETURNING *`,
            [currentValue, progress, id, branchId]
        );

        // Record progress update
        await db.query(
            `INSERT INTO goal_progress_updates (
        goal_id, previous_value, current_value, progress_percentage, update_notes, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, previousValue, currentValue, progress, notes, userId]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function deleteGoal(req, res, next) {
    try {
        const { id } = req.params;
        const { branchId } = req.user;

        const result = await db.query(
            'DELETE FROM performance_goals WHERE id = $1 AND branch_id = $2 RETURNING id',
            [id, branchId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// APPRAISAL CYCLES
// ============================================================================

async function listAppraisalCycles(req, res, next) {
    try {
        const { status } = req.query;
        const { branchId } = req.user;

        let query = `
      SELECT ac.*,
        (SELECT COUNT(*) FROM performance_reviews WHERE appraisal_cycle_id = ac.id) as total_reviews,
        (SELECT COUNT(*) FROM performance_reviews WHERE appraisal_cycle_id = ac.id AND status = 'FINALIZED') as completed_reviews
      FROM appraisal_cycles ac
      WHERE ac.branch_id = $1
    `;

        const params = [branchId];

        if (status) {
            query += ` AND ac.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY ac.start_date DESC`;

        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
}

async function createAppraisalCycle(req, res, next) {
    try {
        const {
            name, description, startDate, endDate, cycleType,
            selfAssessmentEnabled, managerAssessmentEnabled,
            peerFeedbackEnabled, subordinateFeedbackEnabled,
            selfAssessmentDeadline, managerAssessmentDeadline, feedbackDeadline
        } = req.body;
        const { branchId, userId } = req.user;

        const result = await db.query(
            `INSERT INTO appraisal_cycles (
        name, description, start_date, end_date, cycle_type,
        self_assessment_enabled, manager_assessment_enabled,
        peer_feedback_enabled, subordinate_feedback_enabled,
        self_assessment_deadline, manager_assessment_deadline, feedback_deadline,
        branch_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
            [
                name, description, startDate, endDate, cycleType,
                selfAssessmentEnabled, managerAssessmentEnabled,
                peerFeedbackEnabled, subordinateFeedbackEnabled,
                selfAssessmentDeadline, managerAssessmentDeadline, feedbackDeadline,
                branchId, userId
            ]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function updateAppraisalCycle(req, res, next) {
    try {
        const { id } = req.params;
        const {
            name, description, startDate, endDate, status,
            selfAssessmentDeadline, managerAssessmentDeadline, feedbackDeadline
        } = req.body;
        const { branchId } = req.user;

        const result = await db.query(
            `UPDATE appraisal_cycles SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        status = COALESCE($5, status),
        self_assessment_deadline = COALESCE($6, self_assessment_deadline),
        manager_assessment_deadline = COALESCE($7, manager_assessment_deadline),
        feedback_deadline = COALESCE($8, feedback_deadline),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND branch_id = $10
      RETURNING *`,
            [
                name, description, startDate, endDate, status,
                selfAssessmentDeadline, managerAssessmentDeadline, feedbackDeadline,
                id, branchId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Appraisal cycle not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function getAppraisalCycleStats(req, res, next) {
    try {
        const { id } = req.params;
        const { branchId } = req.user;

        const stats = await db.query(
            `SELECT
        COUNT(*) as total_reviews,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
        COUNT(*) FILTER (WHERE status = 'SELF_COMPLETED') as self_completed,
        COUNT(*) FILTER (WHERE status = 'MANAGER_COMPLETED') as manager_completed,
        COUNT(*) FILTER (WHERE status = 'FINALIZED') as finalized,
        AVG(final_rating) FILTER (WHERE status = 'FINALIZED') as average_rating
      FROM performance_reviews
      WHERE appraisal_cycle_id = $1 AND branch_id = $2`,
            [id, branchId]
        );

        res.json({ success: true, data: stats.rows[0] });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// PERFORMANCE REVIEWS
// ============================================================================

async function listReviews(req, res, next) {
    try {
        const { employeeId, appraisalCycleId, status } = req.query;
        const { branchId } = req.user;

        let query = `
      SELECT 
        pr.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.employee_code,
        r.first_name || ' ' || r.last_name as reviewer_name,
        ac.name as appraisal_cycle_name
      FROM performance_reviews pr
      LEFT JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN employees r ON pr.reviewer_id = r.id
      LEFT JOIN appraisal_cycles ac ON pr.appraisal_cycle_id = ac.id
      WHERE pr.branch_id = $1
    `;

        const params = [branchId];
        let paramCount = 1;

        if (employeeId) {
            paramCount++;
            query += ` AND pr.employee_id = $${paramCount}`;
            params.push(employeeId);
        }

        if (appraisalCycleId) {
            paramCount++;
            query += ` AND pr.appraisal_cycle_id = $${paramCount}`;
            params.push(appraisalCycleId);
        }

        if (status) {
            paramCount++;
            query += ` AND pr.status = $${paramCount}`;
            params.push(status);
        }

        query += ` ORDER BY pr.created_at DESC`;

        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
}

async function createReview(req, res, next) {
    try {
        const { employeeId, appraisalCycleId, reviewerId } = req.body;
        const { branchId } = req.user;

        const result = await db.query(
            `INSERT INTO performance_reviews (
        employee_id, appraisal_cycle_id, reviewer_id, branch_id
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
            [employeeId, appraisalCycleId, reviewerId, branchId]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function submitSelfAssessment(req, res, next) {
    try {
        const { id } = req.params;
        const { comments, overallRating, ratings } = req.body;
        const { branchId } = req.user;

        // Update review
        const result = await db.query(
            `UPDATE performance_reviews SET
        self_assessment_comments = $1,
        self_overall_rating = $2,
        self_assessment_submitted_at = CURRENT_TIMESTAMP,
        status = 'SELF_COMPLETED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND branch_id = $4
      RETURNING *`,
            [comments, overallRating, id, branchId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Save individual ratings
        if (ratings && Array.isArray(ratings)) {
            for (const rating of ratings) {
                await db.query(
                    `INSERT INTO review_ratings (review_id, criteria_id, self_rating, self_comments)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (review_id, criteria_id) 
          DO UPDATE SET self_rating = $3, self_comments = $4`,
                    [id, rating.criteriaId, rating.rating, rating.comments]
                );
            }
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function submitManagerAssessment(req, res, next) {
    try {
        const { id } = req.params;
        const { comments, overallRating, ratings } = req.body;
        const { branchId } = req.user;

        // Update review
        const result = await db.query(
            `UPDATE performance_reviews SET
        manager_assessment_comments = $1,
        manager_overall_rating = $2,
        manager_assessment_submitted_at = CURRENT_TIMESTAMP,
        status = 'MANAGER_COMPLETED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND branch_id = $4
      RETURNING *`,
            [comments, overallRating, id, branchId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Save individual ratings
        if (ratings && Array.isArray(ratings)) {
            for (const rating of ratings) {
                await db.query(
                    `INSERT INTO review_ratings (review_id, criteria_id, manager_rating, manager_comments)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (review_id, criteria_id) 
          DO UPDATE SET manager_rating = $3, manager_comments = $4`,
                    [id, rating.criteriaId, rating.rating, rating.comments]
                );
            }
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function submitFeedback(req, res, next) {
    try {
        const { reviewId, feedbackProviderId, feedbackType, strengths, areasForImprovement, overallComments, rating } = req.body;

        const result = await db.query(
            `INSERT INTO review_feedback (
        review_id, feedback_provider_id, feedback_type, strengths, areas_for_improvement, overall_comments, rating, status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'SUBMITTED', CURRENT_TIMESTAMP)
      RETURNING *`,
            [reviewId, feedbackProviderId, feedbackType, strengths, areasForImprovement, overallComments, rating]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function finalizeReview(req, res, next) {
    try {
        const { id } = req.params;
        const { finalRating, finalComments, promotionRecommended, incrementRecommended, incrementPercentage, trainingRecommended } = req.body;
        const { branchId, userId } = req.user;

        const result = await db.query(
            `UPDATE performance_reviews SET
        final_rating = $1,
        final_comments = $2,
        promotion_recommended = $3,
        increment_recommended = $4,
        increment_percentage = $5,
        training_recommended = $6,
        status = 'FINALIZED',
        finalized_at = CURRENT_TIMESTAMP,
        finalized_by = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND branch_id = $9
      RETURNING *`,
            [finalRating, finalComments, promotionRecommended, incrementRecommended, incrementPercentage, trainingRecommended, userId, id, branchId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

// ============================================================================
// TRAINING PROGRAMS
// ============================================================================

async function listTrainingPrograms(req, res, next) {
    try {
        const { status, category } = req.query;
        const { branchId } = req.user;

        let query = `
      SELECT tp.*,
        (SELECT COUNT(*) FROM training_participants WHERE training_program_id = tp.id) as total_participants,
        (SELECT COUNT(*) FROM training_participants WHERE training_program_id = tp.id AND completion_status = 'COMPLETED') as completed_participants
      FROM training_programs tp
      WHERE tp.branch_id = $1
    `;

        const params = [branchId];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND tp.status = $${paramCount}`;
            params.push(status);
        }

        if (category) {
            paramCount++;
            query += ` AND tp.category = $${paramCount}`;
            params.push(category);
        }

        query += ` ORDER BY tp.start_date DESC`;

        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
}

async function createTrainingProgram(req, res, next) {
    try {
        const {
            title, description, category, level, durationHours, maxParticipants,
            startDate, endDate, location, mode, trainerName, trainerOrganization,
            trainerContact, costPerParticipant, totalBudget
        } = req.body;
        const { branchId, userId } = req.user;

        const result = await db.query(
            `INSERT INTO training_programs (
        title, description, category, level, duration_hours, max_participants,
        start_date, end_date, location, mode, trainer_name, trainer_organization,
        trainer_contact, cost_per_participant, total_budget, branch_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
            [
                title, description, category, level, durationHours, maxParticipants,
                startDate, endDate, location, mode, trainerName, trainerOrganization,
                trainerContact, costPerParticipant, totalBudget, branchId, userId
            ]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function updateTrainingProgram(req, res, next) {
    try {
        const { id } = req.params;
        const { title, description, startDate, endDate, location, status } = req.body;
        const { branchId } = req.user;

        const result = await db.query(
            `UPDATE training_programs SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        location = COALESCE($5, location),
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND branch_id = $8
      RETURNING *`,
            [title, description, startDate, endDate, location, status, id, branchId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Training program not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function deleteTrainingProgram(req, res, next) {
    try {
        const { id } = req.params;
        const { branchId } = req.user;

        const result = await db.query(
            'DELETE FROM training_programs WHERE id = $1 AND branch_id = $2 RETURNING id',
            [id, branchId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Training program not found' });
        }

        res.json({ success: true, message: 'Training program deleted successfully' });
    } catch (error) {
        next(error);
    }
}

async function enrollParticipant(req, res, next) {
    try {
        const { trainingProgramId, employeeId, totalSessions } = req.body;

        const result = await db.query(
            `INSERT INTO training_participants (training_program_id, employee_id, total_sessions)
      VALUES ($1, $2, $3)
      RETURNING *`,
            [trainingProgramId, employeeId, totalSessions]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function updateParticipant(req, res, next) {
    try {
        const { id } = req.params;
        const { attendedSessions, attendancePercentage, finalScore, completionStatus, certificateIssued, feedbackRating, feedbackComments } = req.body;

        const result = await db.query(
            `UPDATE training_participants SET
        attended_sessions = COALESCE($1, attended_sessions),
        attendance_percentage = COALESCE($2, attendance_percentage),
        final_score = COALESCE($3, final_score),
        completion_status = COALESCE($4, completion_status),
        certificate_issued = COALESCE($5, certificate_issued),
        feedback_rating = COALESCE($6, feedback_rating),
        feedback_comments = COALESCE($7, feedback_comments),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
            [attendedSessions, attendancePercentage, finalScore, completionStatus, certificateIssued, feedbackRating, feedbackComments, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Participant not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

async function listParticipants(req, res, next) {
    try {
        const { trainingProgramId } = req.query;

        const result = await db.query(
            `SELECT tp.*, e.first_name || ' ' || e.last_name as employee_name, e.employee_code
      FROM training_participants tp
      LEFT JOIN employees e ON tp.employee_id = e.id
      WHERE tp.training_program_id = $1
      ORDER BY tp.enrollment_date DESC`,
            [trainingProgramId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    // Goals
    listGoals,
    createGoal,
    updateGoal,
    updateGoalProgress,
    deleteGoal,

    // Appraisal Cycles
    listAppraisalCycles,
    createAppraisalCycle,
    updateAppraisalCycle,
    getAppraisalCycleStats,

    // Reviews
    listReviews,
    createReview,
    submitSelfAssessment,
    submitManagerAssessment,
    submitFeedback,
    finalizeReview,

    // Training
    listTrainingPrograms,
    createTrainingProgram,
    updateTrainingProgram,
    deleteTrainingProgram,
    enrollParticipant,
    updateParticipant,
    listParticipants,
};
