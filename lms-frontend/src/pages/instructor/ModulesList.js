import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaBook } from 'react-icons/fa';
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
          title: 'Solar Auditing',
          code: 'SA101',
          description: 'Learn about solar energy auditing techniques and practices.',
          instructor: { name: 'Dr. Tevin Memla' },
          students: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
          ],
          content: [
            {
              id: 1,
              title: 'Introduction to Solar Energy',
              type: 'lecture',
              description: 'Overview of solar energy and its applications'
            }
          ]
        },
        {
          id: 2,
          title: 'New Venture Creation',
          code: 'NVC201',
          description: 'Explore the fundamentals of creating and managing new business ventures.',
          instructor: { name: 'Dr. Johnson' },
          students: [
            { id: 3, name: 'Mike Brown', email: 'mike@example.com' },
            { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com' }
          ],
          content: [
            {
              id: 1,
              title: 'Business Model Canvas',
              type: 'lecture',
              description: 'Understanding the business model canvas and its components'
            }
          ]
        },
        {
          id: 3,
          title: 'Intro Into Renewable Energy',
          code: 'IRE301',
          description: 'An introduction to various renewable energy sources and their impact on the environment.',
          instructor: { name: 'Dr. Williams' },
          students: [
            { id: 5, name: 'Alex Turner', email: 'alex@example.com' },
            { id: 6, name: 'Emma Davis', email: 'emma@example.com' }
          ],
          content: [
            {
              id: 1,
              title: 'Types of Renewable Energy',
              type: 'lecture',
              description: 'Overview of different renewable energy sources'
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
                <span>Instructor: {module.instructor_name ? module.instructor_name : 'Not assigned'}</span>
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