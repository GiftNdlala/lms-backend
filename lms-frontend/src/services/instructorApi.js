import api from './api';
import { quizzes } from './api';

const instructorApi = {
  // Profile
  getProfile: async () => {
    try {
      const response = await api.get('/accounts/instructors/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/accounts/instructors/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating instructor profile:', error);
      throw error;
    }
  },

  // Students
  getStudents: async () => {
    try {
      const response = await api.get('/accounts/instructors/students/');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  addStudent: async (studentData) => {
    try {
      const response = await api.post('/accounts/instructors/add_student/', studentData);
      return response.data;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  deleteStudent: async (studentId) => {
    try {
      const response = await api.delete(`/accounts/instructors/students/${studentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Modules
  getModules: async () => {
    try {
      const response = await api.get('/modules/instructor/modules/');
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },

  getModuleDetails: async (moduleId) => {
    try {
      const response = await api.get(`/modules/instructor/modules/${moduleId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module details:', error);
      throw error;
    }
  },

  createModule: async (moduleData) => {
    try {
      const response = await api.post('/modules/instructor/modules/', moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  },

  updateModule: async (moduleId, moduleData) => {
    try {
      const response = await api.patch(`/modules/instructor/modules/${moduleId}/`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  },

  deleteModule: async (moduleId) => {
    try {
      const response = await api.delete(`/modules/instructor/modules/${moduleId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  },

  // Module Content
  uploadContent: async (moduleId, formData) => {
    try {
      const response = await api.post(`/modules/instructor/modules/${moduleId}/contents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading content:', error);
      throw error;
    }
  },

  deleteContent: async (moduleId, contentId) => {
    try {
      const response = await api.delete(`/modules/instructor/modules/${moduleId}/contents/${contentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },

  // Quiz Management
  getModuleQuizzes: async (moduleId) => {
    return quizzes.getModuleQuizzes(moduleId);
  },

  createQuiz: async (moduleId, quizData) => {
    return quizzes.createQuiz(moduleId, quizData);
  },

  addQuizQuestion: async (quizId, questionData) => {
    return quizzes.addQuizQuestion(quizId, questionData);
  },

  publishQuiz: async (quizId) => {
    return quizzes.publishQuiz(quizId);
  },

  getQuizQuestions: async (quizId) => {
    return quizzes.getQuizQuestions(quizId);
  },

  // Assigned Modules
  getAssignedModules: async () => {
    try {
      const response = await api.get('/accounts/instructors/assigned_modules/');
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned modules:', error);
      throw error;
    }
  },

  // Module Templates
  getModuleTemplates: async () => {
    try {
      const response = await api.get('/modules/templates/');
      return response.data;
    } catch (error) {
      console.error('Error fetching module templates:', error);
      throw error;
    }
  },

  createModuleTemplate: async (templateData) => {
    try {
      const response = await api.post('/modules/templates/', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating module template:', error);
      throw error;
    }
  },

  updateModuleTemplate: async (templateId, templateData) => {
    try {
      const response = await api.patch(`/modules/templates/${templateId}/`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating module template:', error);
      throw error;
    }
  },

  deleteModuleTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/modules/templates/${templateId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting module template:', error);
      throw error;
    }
  },
};

export default instructorApi; 