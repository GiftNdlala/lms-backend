import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaBook, FaUsers } from 'react-icons/fa';
import instructorApi from '../../services/instructorApi';
import './InstructorStyles.css';

const ModulesList = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await instructorApi.getModules();
      const modulesData = Array.isArray(response) ? response : response.results || [];
      setModules(modulesData);
    } catch (err) {
      setError('Failed to load modules. Please try again later.');
      // Add dummy modules for testing
      const dummyModules = [
        {
          id: 1,
          title: 'Introduction to Programming',
          code: 'CS101',
          description: 'Basic programming concepts and practices',
          instructor: { name: 'Dr. Smith' },
          students: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
          ],
          content: [
            {
              id: 1,
              title: 'Getting Started with Programming',
              type: 'lecture',
              description: 'Introduction to basic programming concepts'
            },
            {
              id: 2,
              title: 'Variables and Data Types',
              type: 'lecture',
              description: 'Understanding different data types and variables'
            }
          ]
        },
        {
          id: 2,
          title: 'Data Structures',
          code: 'CS201',
          description: 'Advanced data structures and algorithms',
          instructor: { name: 'Dr. Johnson' },
          students: [
            { id: 3, name: 'Mike Brown', email: 'mike@example.com' },
            { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com' }
          ],
          content: [
            {
              id: 1,
              title: 'Arrays and Linked Lists',
              type: 'lecture',
              description: 'Understanding basic data structures'
            },
            {
              id: 2,
              title: 'Trees and Graphs',
              type: 'lecture',
              description: 'Advanced data structures and their applications'
            }
          ]
        },
        {
          id: 3,
          title: 'Web Development',
          code: 'CS301',
          description: 'Modern web development technologies and practices',
          instructor: { name: 'Dr. Williams' },
          students: [
            { id: 5, name: 'Alex Turner', email: 'alex@example.com' },
            { id: 6, name: 'Emma Davis', email: 'emma@example.com' }
          ],
          content: [
            {
              id: 1,
              title: 'HTML and CSS Fundamentals',
              type: 'lecture',
              description: 'Building the structure and style of web pages'
            },
            {
              id: 2,
              title: 'JavaScript Basics',
              type: 'lecture',
              description: 'Introduction to JavaScript programming'
            }
          ]
        }
      ];
      setModules(dummyModules);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    try {
      await instructorApi.deleteModule(moduleId);
      setModules(modules.filter(m => m.id !== moduleId));
    } catch (err) {
      setError('Failed to delete module. Please try again.');
    }
  };

  return (
    <div className="modules-container">
      <div className="modules-header">
        <h2>Modules</h2>
        <button className="btn-primary" onClick={() => navigate('/dashboard/instructor/modules/create')}>Create New Module</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-container"><div className="loading">Loading modules...</div></div>
      ) : null}
      <div className="modules-grid">
        {modules.length === 0 && !loading ? (
          <div className="no-modules">No modules found. Create your first module to get started.</div>
        ) : (
          modules.map(module => (
            <div key={module.id} className="module-card">
              <div className="module-card-header">
                <h3>{module.title}</h3>
                <span className="module-code">Code: {module.code}</span>
              </div>
              <div className="module-card-body">
                <p>{module.description}</p>
                <div className="module-meta">
                  <span>Instructor: {module.instructor?.name || 'Not assigned'}</span>
                  <span>Students: {module.students?.length || 0}</span>
                </div>
              </div>
              <div className="module-card-actions">
                <button
                  className="icon-button"
                  title="Manage Content"
                  onClick={() => navigate(`/dashboard/instructor/modules/${module.id}/content`)}
                >
                  <FaBook /> Manage Content
                </button>
                <button
                  className="icon-button"
                  title="Manage Students"
                  onClick={() => navigate(`/dashboard/instructor/modules/${module.id}/assign-students`)}
                >
                  <FaUsers /> Manage Students
                </button>
                <button
                  className="icon-button"
                  title="Edit"
                  onClick={() => navigate(`/dashboard/instructor/modules/${module.id}/edit`)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="icon-button delete"
                  title="Delete"
                  onClick={() => handleDelete(module.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModulesList; 