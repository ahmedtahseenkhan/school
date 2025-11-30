-- Migration: 027_create_recruitment_workflow.sql
-- Description: Creates tables for enhanced Recruitment Management workflow

-- Job Applications Table (links applicants to job postings)
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    job_posting_id INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    applicant_id INTEGER NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    
    -- Application Details
    application_date DATE DEFAULT CURRENT_DATE,
    source VARCHAR(50), -- WEBSITE, REFERRAL, LINKEDIN, INDEED, etc.
    referrer_employee_id INTEGER REFERENCES employees(id),
    
    -- Current Status
    current_stage VARCHAR(50) DEFAULT 'APPLIED', -- APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, WITHDRAWN, REJECTED, HIRED
    
    -- Resume and Documents
    resume_url VARCHAR(500),
    cover_letter TEXT,
    portfolio_url VARCHAR(500),
    
    -- Screening
    screening_score INTEGER,
    screening_notes TEXT,
    screening_by INTEGER REFERENCES users(id),
    screening_date DATE,
    
    -- Overall Assessment
    overall_rating DECIMAL(3,2),
    overall_notes TEXT,
    
    -- Rejection
    rejection_reason TEXT,
    rejected_by INTEGER REFERENCES users(id),
    rejected_at TIMESTAMP,
    
    -- Metadata
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(job_posting_id, applicant_id)
);

-- Application Stage History Table (tracks movement through pipeline)
CREATE TABLE IF NOT EXISTS application_stage_history (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    
    -- Stage Details
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    
    -- Change Details
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Panels Table (defines interview panel members)
CREATE TABLE IF NOT EXISTS interview_panels (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    panel_member_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Panel Member Role
    role VARCHAR(50) DEFAULT 'INTERVIEWER', -- INTERVIEWER, LEAD, OBSERVER
    
    -- Feedback Status
    feedback_submitted BOOLEAN DEFAULT FALSE,
    feedback_submitted_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(interview_id, panel_member_id)
);

-- Interview Feedback Table (structured feedback from panel members)
CREATE TABLE IF NOT EXISTS interview_feedback (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    panel_member_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    application_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    
    -- Technical Assessment
    technical_skills_rating INTEGER CHECK (technical_skills_rating >= 1 AND technical_skills_rating <= 5),
    technical_skills_comments TEXT,
    
    -- Behavioral Assessment
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    problem_solving_rating INTEGER CHECK (problem_solving_rating >= 1 AND problem_solving_rating <= 5),
    teamwork_rating INTEGER CHECK (teamwork_rating >= 1 AND teamwork_rating <= 5),
    leadership_rating INTEGER CHECK (leadership_rating >= 1 AND leadership_rating <= 5),
    
    -- Overall Assessment
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    strengths TEXT,
    weaknesses TEXT,
    overall_comments TEXT,
    
    -- Recommendation
    recommendation VARCHAR(20), -- STRONG_HIRE, HIRE, MAYBE, NO_HIRE
    
    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED
    submitted_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(interview_id, panel_member_id)
);

-- Offer Letters Table
CREATE TABLE IF NOT EXISTS offer_letters (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    job_posting_id INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    applicant_id INTEGER NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    
    -- Offer Details
    designation_id INTEGER REFERENCES designations(id),
    department_id INTEGER REFERENCES departments(id),
    
    -- Compensation
    offered_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    salary_frequency VARCHAR(20) DEFAULT 'MONTHLY', -- MONTHLY, ANNUAL
    
    -- Additional Benefits
    benefits TEXT,
    allowances JSONB, -- {housing: 1000, transport: 500, etc.}
    bonus_structure TEXT,
    
    -- Employment Terms
    employment_type VARCHAR(20), -- FULL_TIME, PART_TIME, CONTRACT, INTERN
    probation_period_months INTEGER DEFAULT 3,
    notice_period_days INTEGER DEFAULT 30,
    
    -- Dates
    joining_date DATE,
    offer_valid_until DATE,
    
    -- Offer Status
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, WITHDRAWN, EXPIRED
    sent_at TIMESTAMP,
    response_received_at TIMESTAMP,
    
    -- Acceptance/Rejection
    candidate_response VARCHAR(20), -- ACCEPTED, REJECTED, NEGOTIATING
    candidate_comments TEXT,
    negotiation_notes TEXT,
    
    -- Document
    offer_letter_url VARCHAR(500),
    generated_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Metadata
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offer Negotiations Table (track negotiation history)
CREATE TABLE IF NOT EXISTS offer_negotiations (
    id SERIAL PRIMARY KEY,
    offer_letter_id INTEGER NOT NULL REFERENCES offer_letters(id) ON DELETE CASCADE,
    
    -- Negotiation Details
    negotiation_type VARCHAR(50), -- SALARY, JOINING_DATE, BENEFITS, etc.
    requested_value TEXT,
    current_value TEXT,
    
    -- Response
    company_response VARCHAR(20), -- ACCEPTED, REJECTED, COUNTER_OFFER
    response_notes TEXT,
    responded_by INTEGER REFERENCES users(id),
    responded_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidate Communications Table (track all communications)
CREATE TABLE IF NOT EXISTS candidate_communications (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    
    -- Communication Details
    communication_type VARCHAR(50), -- EMAIL, PHONE, SMS, IN_PERSON
    subject VARCHAR(255),
    message TEXT,
    
    -- Direction
    direction VARCHAR(20), -- OUTBOUND, INBOUND
    
    -- Sender/Receiver
    sent_by INTEGER REFERENCES users(id),
    sent_to VARCHAR(255), -- Email or phone
    
    -- Attachments
    attachments JSONB, -- [{name: 'file.pdf', url: 'https://...'}]
    
    -- Status
    status VARCHAR(20) DEFAULT 'SENT', -- DRAFT, SENT, DELIVERED, FAILED
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update existing interviews table to add more fields (if not already present)
-- This is an ALTER statement to enhance the existing interviews table
DO $$
BEGIN
    -- Add interview type if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='interviews' AND column_name='interview_type') THEN
        ALTER TABLE interviews ADD COLUMN interview_type VARCHAR(50) DEFAULT 'TECHNICAL';
    END IF;
    
    -- Add interview round if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='interviews' AND column_name='interview_round') THEN
        ALTER TABLE interviews ADD COLUMN interview_round INTEGER DEFAULT 1;
    END IF;
    
    -- Add duration if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='interviews' AND column_name='duration_minutes') THEN
        ALTER TABLE interviews ADD COLUMN duration_minutes INTEGER DEFAULT 60;
    END IF;
    
    -- Add meeting link if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='interviews' AND column_name='meeting_link') THEN
        ALTER TABLE interviews ADD COLUMN meeting_link VARCHAR(500);
    END IF;
    
    -- Add application_id reference if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='interviews' AND column_name='application_id') THEN
        ALTER TABLE interviews ADD COLUMN application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create Indexes for Recruitment
CREATE INDEX idx_job_applications_posting ON job_applications(job_posting_id);
CREATE INDEX idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_stage ON job_applications(current_stage);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_branch ON job_applications(branch_id);
CREATE INDEX idx_job_applications_date ON job_applications(application_date);

CREATE INDEX idx_application_stage_history_application ON application_stage_history(application_id);
CREATE INDEX idx_application_stage_history_date ON application_stage_history(changed_at);

CREATE INDEX idx_interview_panels_interview ON interview_panels(interview_id);
CREATE INDEX idx_interview_panels_member ON interview_panels(panel_member_id);

CREATE INDEX idx_interview_feedback_interview ON interview_feedback(interview_id);
CREATE INDEX idx_interview_feedback_application ON interview_feedback(application_id);
CREATE INDEX idx_interview_feedback_member ON interview_feedback(panel_member_id);

CREATE INDEX idx_offer_letters_application ON offer_letters(application_id);
CREATE INDEX idx_offer_letters_applicant ON offer_letters(applicant_id);
CREATE INDEX idx_offer_letters_status ON offer_letters(status);
CREATE INDEX idx_offer_letters_branch ON offer_letters(branch_id);

CREATE INDEX idx_offer_negotiations_offer ON offer_negotiations(offer_letter_id);

CREATE INDEX idx_candidate_communications_application ON candidate_communications(application_id);
CREATE INDEX idx_candidate_communications_date ON candidate_communications(sent_at);

-- Add Comments
COMMENT ON TABLE job_applications IS 'Links applicants to job postings with application tracking';
COMMENT ON TABLE application_stage_history IS 'Tracks movement through recruitment pipeline';
COMMENT ON TABLE interview_panels IS 'Defines interview panel members for each interview';
COMMENT ON TABLE interview_feedback IS 'Structured feedback from interview panel members';
COMMENT ON TABLE offer_letters IS 'Job offer letters with compensation and terms';
COMMENT ON TABLE offer_negotiations IS 'Tracks salary and benefit negotiations';
COMMENT ON TABLE candidate_communications IS 'All communications with candidates';
