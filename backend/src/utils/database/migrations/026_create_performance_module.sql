-- Migration: 026_create_performance_module.sql
-- Description: Creates tables for Performance Management (Goals, Appraisals, Reviews, Training)

-- Appraisal Cycles Table (created first as it's referenced by other tables)
CREATE TABLE IF NOT EXISTS appraisal_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Cycle Period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Configuration
    cycle_type VARCHAR(20) DEFAULT 'ANNUAL', -- ANNUAL, SEMI_ANNUAL, QUARTERLY
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, COMPLETED, CANCELLED
    
    -- Review Settings
    self_assessment_enabled BOOLEAN DEFAULT TRUE,
    manager_assessment_enabled BOOLEAN DEFAULT TRUE,
    peer_feedback_enabled BOOLEAN DEFAULT FALSE,
    subordinate_feedback_enabled BOOLEAN DEFAULT FALSE,
    
    -- Deadlines
    self_assessment_deadline DATE,
    manager_assessment_deadline DATE,
    feedback_deadline DATE,
    
    -- Metadata
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Goals Table
CREATE TABLE IF NOT EXISTS performance_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- SMART Criteria
    specific TEXT,
    measurable TEXT,
    achievable TEXT,
    relevant TEXT,
    time_bound DATE,
    
    -- Goal Details
    category VARCHAR(50), -- INDIVIDUAL, TEAM, ORGANIZATIONAL
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50), -- %, units, currency, etc.
    
    -- Tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, COMPLETED, CANCELLED
    
    -- Relationships
    appraisal_cycle_id UUID REFERENCES appraisal_cycles(id) ON DELETE SET NULL,
    parent_goal_id UUID REFERENCES performance_goals(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Metadata
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Reviews Table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    appraisal_cycle_id UUID NOT NULL REFERENCES appraisal_cycles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Review Status
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SELF_COMPLETED, MANAGER_COMPLETED, FINALIZED
    
    -- Self Assessment
    self_assessment_submitted_at TIMESTAMP,
    self_assessment_comments TEXT,
    self_overall_rating DECIMAL(3,2),
    
    -- Manager Assessment
    manager_assessment_submitted_at TIMESTAMP,
    manager_assessment_comments TEXT,
    manager_overall_rating DECIMAL(3,2),
    
    -- Final Rating
    final_rating DECIMAL(3,2),
    final_comments TEXT,
    finalized_at TIMESTAMP,
    finalized_by UUID REFERENCES users(id),
    
    -- Recommendations
    promotion_recommended BOOLEAN DEFAULT FALSE,
    increment_recommended BOOLEAN DEFAULT FALSE,
    increment_percentage DECIMAL(5,2),
    training_recommended TEXT,
    
    -- Metadata
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, appraisal_cycle_id)
);

-- Review Rating Criteria Table
CREATE TABLE IF NOT EXISTS review_rating_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appraisal_cycle_id UUID NOT NULL REFERENCES appraisal_cycles(id) ON DELETE CASCADE,
    
    -- Criteria Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- TECHNICAL, BEHAVIORAL, LEADERSHIP, etc.
    weightage INTEGER DEFAULT 10 CHECK (weightage >= 0 AND weightage <= 100),
    max_rating INTEGER DEFAULT 5,
    
    -- Metadata
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review Ratings Table (Individual ratings for each criterion)
CREATE TABLE IF NOT EXISTS review_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
    criteria_id UUID NOT NULL REFERENCES review_rating_criteria(id) ON DELETE CASCADE,
    
    -- Ratings
    self_rating INTEGER,
    self_comments TEXT,
    manager_rating INTEGER,
    manager_comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(review_id, criteria_id)
);

-- 360 Degree Feedback Table
CREATE TABLE IF NOT EXISTS review_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
    feedback_provider_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Feedback Type
    feedback_type VARCHAR(20) NOT NULL, -- PEER, SUBORDINATE, MANAGER, EXTERNAL
    
    -- Feedback Content
    strengths TEXT,
    areas_for_improvement TEXT,
    overall_comments TEXT,
    rating DECIMAL(3,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SUBMITTED
    submitted_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Programs Table
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Program Details
    category VARCHAR(50), -- TECHNICAL, SOFT_SKILLS, LEADERSHIP, COMPLIANCE, etc.
    level VARCHAR(20), -- BEGINNER, INTERMEDIATE, ADVANCED
    duration_hours INTEGER,
    max_participants INTEGER,
    
    -- Scheduling
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    mode VARCHAR(20) DEFAULT 'OFFLINE', -- ONLINE, OFFLINE, HYBRID
    
    -- Trainer Details
    trainer_name VARCHAR(255),
    trainer_organization VARCHAR(255),
    trainer_contact VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED, ONGOING, COMPLETED, CANCELLED
    
    -- Costs
    cost_per_participant DECIMAL(10,2),
    total_budget DECIMAL(10,2),
    
    -- Metadata
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Participants Table
CREATE TABLE IF NOT EXISTS training_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Enrollment
    enrollment_date DATE DEFAULT CURRENT_DATE,
    enrollment_status VARCHAR(20) DEFAULT 'ENROLLED', -- ENROLLED, WAITLISTED, CANCELLED
    
    -- Attendance
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    attended_sessions INTEGER DEFAULT 0,
    total_sessions INTEGER,
    
    -- Assessment
    pre_assessment_score DECIMAL(5,2),
    post_assessment_score DECIMAL(5,2),
    final_score DECIMAL(5,2),
    
    -- Completion
    completion_status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, FAILED, DROPPED
    completion_date DATE,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_number VARCHAR(100),
    
    -- Feedback
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comments TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(training_program_id, employee_id)
);

-- Goal Progress Updates Table (for tracking goal progress over time)
CREATE TABLE IF NOT EXISTS goal_progress_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES performance_goals(id) ON DELETE CASCADE,
    
    -- Progress Details
    previous_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    progress_percentage INTEGER,
    
    -- Update Details
    update_notes TEXT,
    updated_by UUID REFERENCES users(id),
    update_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_performance_goals_employee ON performance_goals(employee_id);
CREATE INDEX idx_performance_goals_cycle ON performance_goals(appraisal_cycle_id);
CREATE INDEX idx_performance_goals_status ON performance_goals(status);
CREATE INDEX idx_performance_goals_branch ON performance_goals(branch_id);

CREATE INDEX idx_appraisal_cycles_branch ON appraisal_cycles(branch_id);
CREATE INDEX idx_appraisal_cycles_status ON appraisal_cycles(status);
CREATE INDEX idx_appraisal_cycles_dates ON appraisal_cycles(start_date, end_date);

CREATE INDEX idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_cycle ON performance_reviews(appraisal_cycle_id);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX idx_performance_reviews_branch ON performance_reviews(branch_id);

CREATE INDEX idx_review_ratings_review ON review_ratings(review_id);
CREATE INDEX idx_review_feedback_review ON review_feedback(review_id);
CREATE INDEX idx_review_feedback_provider ON review_feedback(feedback_provider_id);

CREATE INDEX idx_training_programs_branch ON training_programs(branch_id);
CREATE INDEX idx_training_programs_status ON training_programs(status);
CREATE INDEX idx_training_programs_dates ON training_programs(start_date, end_date);

CREATE INDEX idx_training_participants_program ON training_participants(training_program_id);
CREATE INDEX idx_training_participants_employee ON training_participants(employee_id);
CREATE INDEX idx_training_participants_status ON training_participants(completion_status);

CREATE INDEX idx_goal_progress_goal ON goal_progress_updates(goal_id);
CREATE INDEX idx_goal_progress_date ON goal_progress_updates(update_date);

-- Add Comments
COMMENT ON TABLE performance_goals IS 'Employee performance goals with SMART criteria';
COMMENT ON TABLE appraisal_cycles IS 'Performance appraisal cycles configuration';
COMMENT ON TABLE performance_reviews IS 'Individual performance reviews';
COMMENT ON TABLE review_rating_criteria IS 'Rating criteria for appraisal cycles';
COMMENT ON TABLE review_ratings IS 'Individual ratings for each criterion';
COMMENT ON TABLE review_feedback IS '360-degree feedback from peers, subordinates, etc.';
COMMENT ON TABLE training_programs IS 'Training and development programs';
COMMENT ON TABLE training_participants IS 'Employee enrollment and completion tracking';
COMMENT ON TABLE goal_progress_updates IS 'Historical tracking of goal progress';
