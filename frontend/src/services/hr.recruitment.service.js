import api from './api';

// ============================================================================
// JOB POSTINGS
// ============================================================================

export const listJobPostings = (filters = {}) => {
  return api.get('/api/hr/job-postings', { params: filters });
};

export const createJobPosting = (data) => {
  return api.post('/api/hr/job-postings', data);
};

export const updateJobPosting = (id, data) => {
  return api.put(`/api/hr/job-postings/${id}`, data);
};

export const deleteJobPosting = (id) => {
  return api.delete(`/api/hr/job-postings/${id}`);
};

// ============================================================================
// APPLICANTS (Legacy)
// ============================================================================

export const listApplicants = (filters = {}) => {
  return api.get('/api/hr/applicants', { params: filters });
};

export const createApplicant = (data) => {
  return api.post('/api/hr/applicants', data);
};

export const updateApplicant = (id, data) => {
  return api.put(`/api/hr/applicants/${id}`, data);
};

export const deleteApplicant = (id) => {
  return api.delete(`/api/hr/applicants/${id}`);
};

// ============================================================================
// JOB APPLICATIONS (Enhanced Workflow)
// ============================================================================

export const listJobApplications = (filters = {}) => {
  return api.get('/api/hr/recruitment/applications', { params: filters });
};

export const createJobApplication = (data) => {
  return api.post('/api/hr/recruitment/applications', data);
};

export const updateApplicationStage = (id, stage, notes = '') => {
  return api.put(`/api/hr/recruitment/applications/${id}/stage`, { stage, notes });
};

// ============================================================================
// INTERVIEWS
// ============================================================================

export const listInterviews = (filters = {}) => {
  return api.get('/api/hr/interviews', { params: filters });
};

export const createInterview = (data) => {
  return api.post('/api/hr/interviews', data);
};

export const updateInterview = (id, data) => {
  return api.put(`/api/hr/interviews/${id}`, data);
};

export const deleteInterview = (id) => {
  return api.delete(`/api/hr/interviews/${id}`);
};

export const scheduleInterview = (data) => {
  return api.post('/api/hr/recruitment/interviews/schedule', data);
};

export const submitInterviewFeedback = (id, data) => {
  return api.post(`/api/hr/recruitment/interviews/${id}/feedback`, data);
};

// ============================================================================
// OFFER LETTERS
// ============================================================================

export const listOfferLetters = (filters = {}) => {
  return api.get('/api/hr/recruitment/offers', { params: filters });
};

export const generateOfferLetter = (data) => {
  return api.post('/api/hr/recruitment/offers', data);
};

export const updateOfferStatus = (id, status, candidateResponse = null, candidateComments = null) => {
  return api.put(`/api/hr/recruitment/offers/${id}/status`, {
    status,
    candidateResponse,
    candidateComments
  });
};

// ============================================================================
// CANDIDATE COMMUNICATIONS
// ============================================================================

export const listCommunications = (applicationId) => {
  return api.get('/api/hr/recruitment/communications', {
    params: { applicationId }
  });
};

export const logCommunication = (data) => {
  return api.post('/api/hr/recruitment/communications', data);
};

// ============================================================================
// ONBOARDING
// ============================================================================

export const listOnboardingTemplates = () => {
  return api.get('/api/hr/onboarding/templates');
};

export const createOnboardingTemplate = (data) => {
  return api.post('/api/hr/onboarding/templates', data);
};

export const updateOnboardingTemplate = (id, data) => {
  return api.put(`/api/hr/onboarding/templates/${id}`, data);
};

export const deleteOnboardingTemplate = (id) => {
  return api.delete(`/api/hr/onboarding/templates/${id}`);
};

export const listOnboardingTasks = (filters = {}) => {
  return api.get('/api/hr/onboarding/tasks', { params: filters });
};

export const createOnboardingTask = (data) => {
  return api.post('/api/hr/onboarding/tasks', data);
};

export const updateOnboardingTask = (id, data) => {
  return api.put(`/api/hr/onboarding/tasks/${id}`, data);
};

export const deleteOnboardingTask = (id) => {
  return api.delete(`/api/hr/onboarding/tasks/${id}`);
};

export const listEmployeeOnboarding = (filters = {}) => {
  return api.get('/api/hr/onboarding/employee', { params: filters });
};

export const createEmployeeOnboarding = (data) => {
  return api.post('/api/hr/onboarding/employee', data);
};

export const updateEmployeeOnboarding = (id, data) => {
  return api.put(`/api/hr/onboarding/employee/${id}`, data);
};

export const deleteEmployeeOnboarding = (id) => {
  return api.delete(`/api/hr/onboarding/employee/${id}`);
};
