import api from './api';
import { quizzes } from './api';

const instructorApi = {
  // Profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/accounts/instructors/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/api/accounts/instructors/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating instructor profile:', error);
      throw error;
    }
  },

  // Students
  getStudents: async () => {
    try {
      const response = await api.get('/api/accounts/instructors/students/');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  addStudent: async (studentData) => {
    try {
      const response = await api.post('/api/accounts/instructors/add_student/', studentData);
      return response.data;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  deleteStudent: async (studentId) => {
    try {
      const response = await api.delete(`/api/accounts/instructors/students/${studentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Modules
  getModules: async () => {
    try {
      const response = await api.get('/api/modules/instructor/modules/');
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },

  getModuleDetails: async (moduleId) => {
    try {
      const response = await api.get(`/api/modules/instructor/modules/${moduleId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module details:', error);
      throw error;
    }
  },

  getModuleStudents: async (moduleId) => {
    try {
      const response = await api.get(`/api/modules/instructor/modules/${moduleId}/students/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module students:', error);
      throw error;
    }
  },

  updateModuleStudents: async (moduleId, studentIds) => {
    try {
      const response = await api.put(`/api/modules/instructor/modules/${moduleId}/students/`, {
        student_ids: studentIds
      });
      return response.data;
    } catch (error) {
      console.error('Error updating module students:', error);
      throw error;
    }
  },

  createModule: async (moduleData) => {
    try {
      const response = await api.post('/api/modules/instructor/modules/', moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  },

  updateModule: async (moduleId, moduleData) => {
    try {
      const response = await api.patch(`/api/modules/instructor/modules/${moduleId}/`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  },

  deleteModule: async (moduleId) => {
    try {
      const response = await api.delete(`/api/modules/instructor/modules/${moduleId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  },

  // Module Content
  uploadContent: async (moduleId, formData) => {
    try {
      const response = await api.post(`/api/modules/instructor/modules/${moduleId}/contents/`, formData, {
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
      const response = await api.delete(`/api/modules/instructor/modules/${moduleId}/contents/${contentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  },

  getModuleContent: async (moduleId) => {
    const response = await api.get(`/api/modules/instructor/modules/${moduleId}/contents/`);
    return response.data;
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
    try {
      const response = await api.post(`/api/modules/quizzes/${quizId}/publish/`);
      return response.data;
    } catch (error) {
      console.error('Error publishing quiz:', error);
      throw error;
    }
  },

  getQuizQuestions: async (quizId) => {
    return quizzes.getQuizQuestions(quizId);
  },

  // Assigned Modules
  getAssignedModules: async () => {
    try {
      const response = await api.get('/api/accounts/instructors/assigned_modules/');
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned modules:', error);
      throw error;
    }
  },

  // Module Templates
  getModuleTemplates: async () => {
    try {
      const response = await api.get('/api/modules/templates/');
      return response.data;
    } catch (error) {
      console.error('Error fetching module templates:', error);
      throw error;
    }
  },

  createModuleTemplate: async (templateData) => {
    try {
      const response = await api.post('/api/modules/templates/', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating module template:', error);
      throw error;
    }
  },

  updateModuleTemplate: async (templateId, templateData) => {
    try {
      const response = await api.patch(`/api/modules/templates/${templateId}/`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating module template:', error);
      throw error;
    }
  },

  deleteModuleTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/api/modules/templates/${templateId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting module template:', error);
      throw error;
    }
  },

  deleteAssignment: async (assignmentId) => {
    try {
      const response = await api.delete(`/api/assignments/${assignmentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  // Announcements
  getAnnouncements: async () => {
    try {
      const response = await api.get('/api/announcements/');
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  createAnnouncement: async (announcementData) => {
    try {
      const response = await api.post('/api/announcements/', announcementData);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  updateAnnouncement: async (announcementId, announcementData) => {
    try {
      const response = await api.patch(`/api/announcements/${announcementId}/`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  deleteAnnouncement: async (announcementId) => {
    try {
      const response = await api.delete(`/api/announcements/${announcementId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // Module Notifications
  getModuleNotifications: async (moduleId) => {
    const response = await api.get(`/api/modules/instructor/modules/${moduleId}/notifications/`);
    return response.data;
  },

  createModuleNotification: async (moduleId, data) => {
    const response = await api.post(`/api/modules/instructor/modules/${moduleId}/notifications/`, data);
    return response.data;
  },

  updateModuleNotification: async (moduleId, notificationId, data) => {
    const response = await api.put(`/api/modules/instructor/modules/${moduleId}/notifications/${notificationId}/`, data);
    return response.data;
  },

  deleteModuleNotification: async (moduleId, notificationId) => {
    const response = await api.delete(`/api/modules/instructor/modules/${moduleId}/notifications/${notificationId}/`);
    return response.data;
  },

  // Section/Unit Management
  getSections: async (moduleId) => {
    const response = await api.get(`/api/modules/instructor/sections/?module=${moduleId}`);
    return response.data;
  },

  createSection: async (data) => {
    const response = await api.post('/api/modules/instructor/sections/', data);
    return response.data;
  },

  updateSection: async (sectionId, data) => {
    const response = await api.put(`/api/modules/instructor/sections/${sectionId}/`, data);
    return response.data;
  },

  deleteSection: async (sectionId) => {
    const response = await api.delete(`/api/modules/instructor/sections/${sectionId}/`);
    return response.data;
  },

  // Section Content Management
  getSectionContents: async (sectionId) => {
    const response = await api.get(`/api/modules/instructor/section-contents/?section=${sectionId}`);
    return response.data;
  },

  createSectionContent: async (data) => {
    const response = await api.post('/api/modules/instructor/section-contents/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateSectionContent: async (contentId, data) => {
    const response = await api.put(`/api/modules/instructor/section-contents/${contentId}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteSectionContent: async (contentId) => {
    const response = await api.delete(`/api/modules/instructor/section-contents/${contentId}/`);
    return response.data;
  },

  // Assignment methods
  createAssignment: async (data) => {
    const response = await api.post('/api/modules/assignments/', data);
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/api/modules/assignments/');
    return response.data;
  },

  getAssignment: async (id) => {
    const response = await api.get(`/api/modules/assignments/${id}/`);
    return response.data;
  },

  updateAssignment: async (id, data) => {
    const response = await api.patch(`/api/modules/assignments/${id}/`, data);
    return response.data;
  },

  gradeAssignment: async (id, data) => {
    const response = await api.post(`/api/modules/assignments/${id}/grade/`, data);
    return response.data;
  },

  getAllQuizzes: async () => {
    try {
      const response = await api.get('/api/modules/instructor/quizzes/');
      return response.data;
    } catch (error) {
      console.error('Error fetching all quizzes:', error);
      throw error;
    }
  },

  deleteQuiz: async (quizId) => {
    try {
      await api.delete(`/api/modules/quizzes/${quizId}/`);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },
};

export default instructorApi; 