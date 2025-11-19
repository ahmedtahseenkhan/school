import api from './api';

// Job postings (masters endpoints)
export async function listJobPostings(params = {}) {
  const { data } = await api.get('/hr/job-postings', { params });
  return data.items || [];
}
export async function createJobPosting(payload) {
  const { data } = await api.post('/hr/job-postings', payload);
  return data.item || data.job || data;
}
export async function updateJobPosting(id, payload) {
  const { data } = await api.put(`/hr/job-postings/${id}`, payload);
  return data.item || data.job || data;
}
export async function deleteJobPosting(id) {
  await api.delete(`/hr/job-postings/${id}`);
}

// Applicants
export async function listApplicants(params = {}) {
  const { data } = await api.get('/hr/applicants', { params });
  return data.items || data.applicants || [];
}
export async function createApplicant(payload) {
  const { data } = await api.post('/hr/applicants', payload);
  return data.item || data.applicant || data;
}
export async function updateApplicant(id, payload) {
  const { data } = await api.put(`/hr/applicants/${id}`, payload);
  return data.item || data.applicant || data;
}
export async function deleteApplicant(id) {
  await api.delete(`/hr/applicants/${id}`);
}

// Interviews
export async function listInterviews(params = {}) {
  const { data } = await api.get('/hr/interviews', { params });
  return data.items || data.interviews || [];
}
export async function createInterview(payload) {
  const { data } = await api.post('/hr/interviews', payload);
  return data.item || data.interview || data;
}
export async function updateInterview(id, payload) {
  const { data } = await api.put(`/hr/interviews/${id}`, payload);
  return data.item || data.interview || data;
}
export async function deleteInterview(id) {
  await api.delete(`/hr/interviews/${id}`);
}

// Onboarding
export async function listOnboarding(params = {}) {
  const { data } = await api.get('/hr/onboarding/employee', { params });
  return data.items || [];
}
export async function createOnboarding(payload) {
  const { data } = await api.post('/hr/onboarding/employee', payload);
  return data.item || data;
}
export async function updateOnboarding(id, payload) {
  const { data } = await api.put(`/hr/onboarding/employee/${id}`, payload);
  return data.item || data;
}
export async function deleteOnboarding(id) {
  await api.delete(`/hr/onboarding/employee/${id}`);
}
