import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import './InstructorStyles.css';

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [contents, setContents] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [notification, setNotification] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [assignedModules, setAssignedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [moduleData, assignedModulesData] = await Promise.all([
        instructorApi.getModuleDetails(moduleId),
        instructorApi.getAssignedModules()
      ]);
      setModule(moduleData);
      setContents(moduleData.contents || []);
      setStudents(moduleData.students || []);
      const allStudents = await instructorApi.getStudents();
      setAvailableStudents(allStudents.filter(
        student => !moduleData.students?.some(s => s.id === student.id)
      ));
      setAssignedModules(assignedModulesData || []);
    } catch (err) {
      console.error('Error fetching module data:', err);
      if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to load module data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    setUploading(true);
    try {
      await instructorApi.uploadContent(moduleId, formData);
      await fetchData();
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await instructorApi.deleteContent(moduleId, contentId);
      setContents(contents.filter(content => content.id !== contentId));
    } catch (err) {
      setError('Failed to delete content');
    }
  };

  const handleStudentAdd = async () => {
    try {
      for (const studentId of selectedStudents) {
        await instructorApi.addStudentToModule(moduleId, { student_id: studentId });
      }
      await fetchData();
      setSelectedStudents([]);
    } catch (err) {
      setError('Failed to add students');
    }
  };

  const handleStudentRemove = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;

    try {
      await instructorApi.removeStudentFromModule(moduleId, studentId);
      setStudents(students.filter(student => student.id !== studentId));
    } catch (err) {
      setError('Failed to remove student');
    }
  };

  const handleNotificationSend = async () => {
    if (!notification.trim()) return;

    try {
      await instructorApi.createNotification({
        module_id: moduleId,
        message: notification,
      });
      setNotification('');
    } catch (err) {
      setError('Failed to send notification');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading module details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button 
          className="button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="error-container">
        <div className="error">Module not found</div>
        <button 
          className="button"
          onClick={() => navigate('/dashboard/instructor/modules')}
        >
          Back to Modules
        </button>
      </div>
    );
  }

  return (
    <div className="module-detail">
      <div className="module-header">
        <h1>{module.title}</h1>
        <div className="module-actions">
          <button
            className="button"
            onClick={() => navigate(`/dashboard/instructor/modules/${moduleId}/edit`)}
          >
            <FaEdit /> Edit Module
          </button>
          <button
            className="button danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this module?')) {
                // Handle module deletion
              }
            }}
          >
            <FaTrash /> Delete Module
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`tab ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          Quizzes
        </button>
        <button
          className={`tab ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned Modules
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview">
            <div className="module-info">
              <h2>Module Information</h2>
              <p><strong>Description:</strong> {module.description}</p>
              <p><strong>Duration:</strong> {module.duration} weeks</p>
              <p><strong>Credits:</strong> {module.credits}</p>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content">
            <h2>Module Content</h2>
            <button
              className="button"
              onClick={() => navigate(`/dashboard/instructor/modules/${moduleId}/add-content`)}
            >
              <FaPlus /> Add Content
            </button>
            <div className="content-list">
              {contents.length === 0 ? (
                <p className="no-content">No content uploaded yet</p>
              ) : (
                contents.map((content) => (
                  <div key={content.id} className="content-item">
                    <div className="content-info">
                      <h3>{content.title}</h3>
                      <p>{content.file_type}</p>
                    </div>
                    <div className="content-actions">
                      <a 
                        href={content.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        Download
                      </a>
                      <button 
                        onClick={() => handleDelete(content.id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="quizzes">
            <h2>Quizzes</h2>
            <button
              className="button"
              onClick={() => navigate(`/dashboard/instructor/modules/${moduleId}/quiz`)}
            >
              <FaPlus /> Add Quiz
            </button>
            {/* Quiz list will go here */}
          </div>
        )}

        {activeTab === 'assigned' && (
          <div className="assigned-modules">
            <h2>Assigned Modules</h2>
            <div className="modules-table">
              <table>
                <thead>
                  <tr>
                    <th>Module Code</th>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Credits</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedModules.map((assignedModule) => (
                    <tr key={assignedModule.id}>
                      <td>{assignedModule.code}</td>
                      <td>{assignedModule.title}</td>
                      <td>{assignedModule.duration} weeks</td>
                      <td>{assignedModule.credits}</td>
                      <td>
                        <button
                          className="button small"
                          onClick={() => navigate(`/dashboard/instructor/modules/${assignedModule.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleDetail; 