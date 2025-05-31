import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ModuleStyles.css';
import { FaBook, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

const StudentModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalModules: 0,
    completedModules: 0,
    upcomingAssignments: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/api/modules/student/modules/');
        
        // Check if response.data exists and has the expected structure
        if (!response.data) {
          throw new Error('No data received from the server');
        }

        // The response might be an array directly or have a modules property
        const modulesData = Array.isArray(response.data) ? response.data : response.data.modules;
        
        if (!Array.isArray(modulesData)) {
          throw new Error('Invalid data format received from server');
        }

        setModules(modulesData);
        
        // Calculate stats
        const completed = modulesData.filter(module => 
          module.progress >= 100
        ).length;
        
        const upcoming = modulesData.reduce((acc, module) => 
          acc + (module.assignments?.filter(a => !a.submitted)?.length || 0), 0
        );

        setStats({
          totalModules: modulesData.length,
          completedModules: completed,
          upcomingAssignments: upcoming
        });
      } catch (error) {
        console.error('Error fetching modules:', error);
        setError(error.message || 'Failed to fetch modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="modules-list-container">
        <div className="loading-message">Loading modules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modules-list-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
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
            <span className="stat-number">{stats.totalModules}</span>
            <span className="stat-label">Total Modules</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{stats.completedModules}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{stats.upcomingAssignments}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
        </div>
      </div>

      <div className="modules-grid">
        {modules.length === 0 ? (
          <div className="no-modules-message">
            <p>No modules available at the moment.</p>
          </div>
        ) : (
          modules.map((module) => (
            <div key={module.id || module._id} className="module-card" onClick={() => navigate(`/dashboard/student/modules/${module.id || module._id}`)} style={{ cursor: 'pointer' }}>
            <div className="module-card-header">
              <span className="module-code">{module.code}</span>
              {module.notifications > 0 && (
                <span className="notification-badge">
                  {module.notifications} new
                </span>
              )}
            </div>
            <div>
              <h2>{module.title}</h2>
              <p className="instructor">
                <FaUserTie />
                  {module.instructor?.name || 'Instructor'}
              </p>
            </div>
            <div className="module-progress">
              <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${module.progress || 0}%` }} />
              </div>
                <span className="progress-text">{module.progress || 0}% Complete</span>
            </div>
            {module.nextAssignment && (
              <div className="next-assignment">
                <h3>Next Assignment</h3>
                <p>{module.nextAssignment.title}</p>
                <span className="due-date">
                  <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                  Due {formatDate(module.nextAssignment.dueDate)}
                </span>
              </div>
            )}
            <div className="module-card-actions">
                <Link to={`/dashboard/student/modules/${module.id || module._id}`} className="view-module-btn">
                <FaBook style={{ marginRight: '0.5rem' }} />
                View Module
              </Link>
              {module.notifications > 0 && (
                  <Link to={`/dashboard/student/modules/${module.id || module._id}/notifications`} className="view-notifications-btn">
                  View Updates
                </Link>
              )}
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentModules; 