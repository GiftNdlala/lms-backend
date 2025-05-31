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
    const response = await api.get('/modules/student/grades/');
    return response.data;
  },

  getGradeDetails: async (gradeId) => {
    const response = await api.get(`/student/grades/${gradeId}/`);
    return response.data;
  },

  // Modules
  getEnrolledModules: async () => {
    const response = await api.get('/modules/student/modules/');
    return response.data;
  },

  getModuleDetails: async (moduleId) => {
    const response = await api.get(`/modules/student/modules/${moduleId}/`);
    return response.data;
  },

  getModuleContent: async (moduleId) => {
    const response = await api.get(`/modules/student/modules/${moduleId}/contents/`);
    return response.data;
  },

  markContentComplete: async (moduleId, contentId) => {
    const response = await api.patch(`/modules/student/modules/${moduleId}/contents/${contentId}/complete/`);
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

  // Notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/modules/student/modules/notifications/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  getNotificationDetails: async (notificationId) => {
    try {
      const response = await api.get(`/modules/student/modules/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification details:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/modules/student/modules/notifications/${notificationId}/read/`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Profile
  getProfile: async () => {
    const response = await api.get('/accounts/student/profile/');
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
    try {
      const response = await api.post(`/modules/quizzes/${quizId}/attempt/`);
      return response.data;
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  },

  submitQuizAttempt: async (attemptId, answers) => {
    try {
      const response = await api.post(`/modules/quiz-attempts/${attemptId}/submit/`, { answers });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  },

  getQuizResults: async (attemptId) => {
    try {
      const response = await api.get(`/modules/quiz-attempts/${attemptId}/results/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }
  },

  getQuizQuestions: async (quizId) => {
    try {
      const response = await api.get(`/modules/quizzes/${quizId}/get-questions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error;
    }
  },

  getModuleAnnouncements: async (moduleId) => {
    const response = await api.get(`/modules/student/modules/${moduleId}/announcements/`);
    return response.data;
  },

  // Assignment methods
  getAssignments: async () => {
    const response = await api.get('/api/assignments/');
    return response.data;
  },

  getAssignment: async (id) => {
    const response = await api.get(`/api/assignments/${id}/`);
    return response.data;
  },

  submitAssignment: async (id, data) => {
    const response = await api.post(`/api/assignments/${id}/submit/`, data);
    return response.data;
  },

  quizzes,

  // Quiz methods
  getQuizzes: async () => {
    try {
      const response = await api.get('/modules/student/quizzes/');
      return response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },
};

export default studentApi; 