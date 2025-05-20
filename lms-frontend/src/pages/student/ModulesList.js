import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './ModuleStyles.css';

function ModulesList() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await api.get('/modules/student/modules/');
        setModules(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError('Failed to load modules. Please try again later.');
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="modules-list-container">
        <div className="modules-header">
          <h1>My Modules</h1>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading modules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modules-list-container">
        <div className="modules-header">
          <h1>My Modules</h1>
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="modules-list-container">
        <div className="modules-header">
          <h1>My Modules</h1>
          <div className="no-modules">
            <p>Waiting for modules to be assigned</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modules-list-container">
      <div className="modules-header">
        <h1>My Modules</h1>
        <div className="modules-stats">
          <div className="stat-box">
            <span className="stat-number">{modules.length}</span>
            <span className="stat-label">Total Modules</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">
              {modules.reduce((sum, module) => sum + (module.notifications || 0), 0)}
            </span>
            <span className="stat-label">New Notifications</span>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        {modules.map(module => (
          <div key={module.id} className="module-card">
            <div className="module-card-header">
              <span className="module-code">{module.code}</span>
              {module.notifications > 0 && (
                <span className="notification-badge">
                  {module.notifications}
                </span>
              )}
            </div>
            
            <h2>{module.title}</h2>
            <p className="instructor">Instructor: {module.instructor?.name || 'Not assigned'}</p>
            
            <div className="module-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${module.progress || 0}%` }}
                />
              </div>
              <span className="progress-text">{module.progress || 0}% Complete</span>
            </div>

            {module.next_assignment && (
              <div className="next-assignment">
                <h3>Next Due</h3>
                <p>{module.next_assignment.title}</p>
                <span className="due-date">Due: {module.next_assignment.due_date}</span>
              </div>
            )}

            <div className="module-card-actions">
              <Link 
                to={`/dashboard/student/modules/${module.id}`}
                className="view-module-btn"
              >
                View Module
              </Link>
              {module.notifications > 0 && (
                <Link 
                  to={`/dashboard/student/modules/${module.id}/notifications`}
                  className="view-notifications-btn"
                >
                  View Notifications
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModulesList; 