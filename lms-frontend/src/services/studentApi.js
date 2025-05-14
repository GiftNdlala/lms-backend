import axios from 'axios';
import { quizzes } from './api';

const BASE_URL = 'http://localhost:8000/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const studentApi = {
  // Grades
  getGrades: async () => {
    const response = await api.get('/student/grades/');
    return response.data;
  },

  getGradeDetails: async (gradeId) => {
    const response = await api.get(`/student/grades/${gradeId}/`);
    return response.data;
  },

  // Modules
  getEnrolledModules: async () => {
    const response = await api.get('/student/modules/');
    return response.data;
  },

  getModuleDetails: async (moduleId) => {
    const response = await api.get(`/student/modules/${moduleId}/`);
    return response.data;
  },

  getModuleContent: async (moduleId) => {
    const response = await api.get(`/student/modules/${moduleId}/contents/`);
    return response.data;
  },

  markContentComplete: async (moduleId, contentId) => {
    const response = await api.patch(`/student/modules/${moduleId}/contents/${contentId}/complete/`);
    return response.data;
  },

  // Assessments
  getAssessments: async () => {
    const response = await api.get('/student/assessments/');
    return response.data;
  },

  getAssessmentDetails: async (assessmentId) => {
    const response = await api.get(`/student/assessments/${assessmentId}/`);
    return response.data;
  },

  submitAssessment: async (assessmentId, answers) => {
    const response = await api.post(`/student/assessments/${assessmentId}/submit/`, { answers });
    return response.data;
  },

  // Announcements
  getAnnouncements: async () => {
    const response = await api.get('/student/announcements/');
    return response.data;
  },

  getAnnouncementDetails: async (announcementId) => {
    const response = await api.get(`/student/announcements/${announcementId}/`);
    return response.data;
  },

  markAnnouncementAsRead: async (announcementId) => {
    const response = await api.post(`/student/announcements/${announcementId}/read/`);
    return response.data;
  },

  // Profile
  getProfile: async () => {
    const response = await api.get('/student/profile/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/student/profile/', profileData);
    return response.data;
  },

  // Quiz Management
  getModuleQuizzes: async (moduleId) => {
    return quizzes.getStudentQuizzes(moduleId);
  },

  startQuizAttempt: async (quizId) => {
    return quizzes.startQuizAttempt(quizId);
  },

  submitQuizAttempt: async (attemptId, answers) => {
    return quizzes.submitQuizAttempt(attemptId, answers);
  },

  getQuizQuestions: async (quizId) => {
    return quizzes.getQuizQuestions(quizId);
  },
};

export default studentApi; 