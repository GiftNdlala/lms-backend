import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import { FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import './InstructorStyles.css';

const ModulesList = () => {
  const navigate = useNavigate();
  const [modulesList, setModulesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [moduleTemplates, setModuleTemplates] = useState([]);
  const [newModule, setNewModule] = useState({
    title: '',
    code: '',
    description: '',
    duration: '',
    credits: '',
    template_id: ''
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);

  useEffect(() => {
    fetchModules();
    fetchStudents();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await instructorApi.getModules();
      // Ensure we have an array of modules
      const modules = Array.isArray(response) ? response : response.results || [];
      console.log('Fetched modules:', modules); // Debug log
      setModulesList(modules);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError('Failed to load modules. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const students = await instructorApi.getStudents();
      console.log('Fetched students:', students); // Debug log
      if (Array.isArray(students)) {
        setAvailableStudents(students);
      } else {
        console.error('Invalid students data:', students);
        setError('Failed to load students data in the correct format.');
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Failed to load students. Please try again later.');
    }
  };

  const fetchModuleTemplates = async () => {
    try {
      const templates = await instructorApi.getModuleTemplates();
      setModuleTemplates(Array.isArray(templates) ? templates : templates.results || []);
    } catch (err) {
      console.error('Error fetching module templates:', err);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    fetchModuleTemplates();
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      const moduleData = {
        title: newModule.title,
        code: newModule.code,
        description: newModule.description,
        duration: parseInt(newModule.duration),
        credits: parseInt(newModule.credits),
        student_ids: selectedStudents,
      };
      if (newModule.template_id) {
        moduleData.template_id = newModule.template_id;
      }
      await instructorApi.createModule(moduleData);
      setShowCreateModal(false);
      await fetchModules();
      setNewModule({ title: '', code: '', description: '', duration: '', credits: '', template_id: '' });
      setSelectedStudents([]);
    } catch (err) {
      console.error('Error creating module:', err);
      if (err.response?.data) {
        setError(`Failed to create module: ${err.response.data.error || err.response.data.detail || 'Please try again.'}`);
      } else {
        setError('Failed to create module. Please try again.');
      }
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await instructorApi.deleteModule(moduleId);
        await fetchModules();
      } catch (err) {
        console.error('Error deleting module:', err);
        setError('Failed to delete module. Please try again.');
      }
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleManageContent = (moduleId) => {
    navigate(`/dashboard/instructor/modules/${moduleId}/content`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading modules...</div>
      </div>
    );
  }

  return (
    <div className="modules-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="modules-header">
        <h2>Modules Management</h2>
        <button 
          className="btn-primary"
          onClick={openCreateModal}
        >
          Create New Module
        </button>
      </div>

      <div className="modules-grid">
        {modulesList && modulesList.length > 0 ? (
          modulesList.map((module) => (
          <div key={module.id} className="module-card">
            <div className="module-header">
              <h3>{module.title}</h3>
              <div className="module-actions">
                <button
                  className="icon-button edit"
                  onClick={() => navigate(`/dashboard/instructor/modules/${module.id}`)}
                  title="Edit module"
                >
                  <FaEdit />
                </button>
                <button
                  className="icon-button delete"
                  onClick={() => handleDeleteModule(module.id)}
                  title="Delete module"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="module-info">
              <p>{module.description}</p>
              <div className="module-meta">
                <span>Duration: {module.duration} weeks</span>
                <span>Credits: {module.credits}</span>
                  <span>Code: {module.code}</span>
                </div>
            </div>

            <div className="module-footer">
              <button
                className="btn-secondary manage-content"
                onClick={() => handleManageContent(module.id)}
              >
                <FaUpload /> Manage Content
              </button>
            </div>
          </div>
          ))
        ) : (
          <div className="no-modules">
            <p>No modules found. Create your first module to get started.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Module</h3>
            <form onSubmit={handleCreateModule}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newModule.title}
                  onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Module Code</label>
                <input
                  type="text"
                  value={newModule.code}
                  onChange={(e) => setNewModule({...newModule, code: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (weeks)</label>
                  <input
                    type="number"
                    min="1"
                    value={newModule.duration}
                    onChange={(e) => setNewModule({...newModule, duration: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Credits</label>
                  <input
                    type="number"
                    min="1"
                    value={newModule.credits}
                    onChange={(e) => setNewModule({...newModule, credits: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Module Template (optional)</label>
                <select
                  value={newModule.template_id}
                  onChange={(e) => setNewModule({...newModule, template_id: e.target.value})}
                >
                  <option value="">-- Select Template --</option>
                  {moduleTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.code} - {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {availableStudents.length > 0 && (
              <div className="form-group">
                <label>Assign Students</label>
                <div className="students-grid">
                  {availableStudents.map(student => (
                    <div key={student.id} className="student-checkbox">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                      />
                      <label htmlFor={`student-${student.id}`}>
                        {student.first_name} {student.last_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesList; 