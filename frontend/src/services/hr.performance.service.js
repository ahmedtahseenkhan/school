import api from './api';

// ============================================================================
// PERFORMANCE GOALS
// ============================================================================

export const listGoals = (filters = {}) => {
    return api.get('/api/hr/performance/goals', { params: filters });
};

export const createGoal = (data) => {
    return api.post('/api/hr/performance/goals', data);
};

export const updateGoal = (id, data) => {
    return api.put(`/api/hr/performance/goals/${id}`, data);
};

export const updateGoalProgress = (id, progressData) => {
    return api.put(`/api/hr/performance/goals/${id}/progress`, progressData);
};

export const deleteGoal = (id) => {
    return api.delete(`/api/hr/performance/goals/${id}`);
};

// ============================================================================
// APPRAISAL CYCLES
// ============================================================================

export const listAppraisalCycles = (filters = {}) => {
    return api.get('/api/hr/performance/appraisal-cycles', { params: filters });
};

export const createAppraisalCycle = (data) => {
    return api.post('/api/hr/performance/appraisal-cycles', data);
};

export const updateAppraisalCycle = (id, data) => {
    return api.put(`/api/hr/performance/appraisal-cycles/${id}`, data);
};

export const getAppraisalCycleStats = (id) => {
    return api.get(`/api/hr/performance/appraisal-cycles/${id}/stats`);
};

// ============================================================================
// PERFORMANCE REVIEWS
// ============================================================================

export const listReviews = (filters = {}) => {
    return api.get('/api/hr/performance/reviews', { params: filters });
};

export const createReview = (data) => {
    return api.post('/api/hr/performance/reviews', data);
};

export const submitSelfAssessment = (id, data) => {
    return api.post(`/api/hr/performance/reviews/${id}/self-assessment`, data);
};

export const submitManagerAssessment = (id, data) => {
    return api.post(`/api/hr/performance/reviews/${id}/manager-assessment`, data);
};

export const submitFeedback = (data) => {
    return api.post(`/api/hr/performance/reviews/${data.reviewId}/feedback`, data);
};

export const finalizeReview = (id, data) => {
    return api.post(`/api/hr/performance/reviews/${id}/finalize`, data);
};

// ============================================================================
// TRAINING PROGRAMS
// ============================================================================

export const listTrainingPrograms = (filters = {}) => {
    return api.get('/api/hr/performance/training/programs', { params: filters });
};

export const createTrainingProgram = (data) => {
    return api.post('/api/hr/performance/training/programs', data);
};

export const updateTrainingProgram = (id, data) => {
    return api.put(`/api/hr/performance/training/programs/${id}`, data);
};

export const deleteTrainingProgram = (id) => {
    return api.delete(`/api/hr/performance/training/programs/${id}`);
};

export const listTrainingParticipants = (trainingProgramId) => {
    return api.get('/api/hr/performance/training/participants', {
        params: { trainingProgramId }
    });
};

export const enrollParticipant = (data) => {
    return api.post('/api/hr/performance/training/participants', data);
};

export const updateParticipant = (id, data) => {
    return api.put(`/api/hr/performance/training/participants/${id}`, data);
};
