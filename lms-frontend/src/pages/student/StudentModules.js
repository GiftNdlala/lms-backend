import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ModuleStyles.css';
import { FaBook, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

const StudentModules = () => {
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState({
    totalModules: 0,
    completedModules: 0,
    upcomingAssignments: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await api.get('/student/modules');
        setModules(response.data.modules);
        
        // Calculate stats
        const completed = response.data.modules.filter(module => 
          module.progress >= 100
        ).length;
        
        const upcoming = response.data.modules.reduce((acc, module) => 
          acc + (module.assignments?.filter(a => !a.submitted)?.length || 0), 0
        );

        setStats({
          totalModules: response.data.modules.length,
          completedModules: completed,
          upcomingAssignments: upcoming
        });
      } catch (error) {
        console.error('Error fetching modules:', error);
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
        {/* Dummy module card for New Venture Creation */}
        <div className="module-card" onClick={() => navigate('/dashboard/student/modules/new-venture-creation')} style={{ cursor: 'pointer', border: '2px solid #6c63ff' }}>
          <div className="module-card-header">
            <span className="module-code">NVC2025_1</span>
          </div>
          <div>
            <h2>New Venture Creation</h2>
            <p className="instructor">
              <span role="img" aria-label="instructor">👤</span> SIHLE MOYO
            </p>
          </div>
          <div className="module-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `0%` }} />
            </div>
            <span className="progress-text">0% Complete</span>
          </div>
        </div>
        {/* Render other modules as before */}
        {modules.map((module) => (
          <div key={module._id} className="module-card" onClick={() => navigate(`/dashboard/student/modules/${module._id}`)} style={{ cursor: 'pointer' }}>
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
                {module.instructor.name}
              </p>
            </div>
            <div className="module-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${module.progress}%` }} />
              </div>
              <span className="progress-text">{module.progress}% Complete</span>
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
              <Link to={`/student/modules/${module._id}`} className="view-module-btn">
                <FaBook style={{ marginRight: '0.5rem' }} />
                View Module
              </Link>
              {module.notifications > 0 && (
                <Link to={`/student/modules/${module._id}/notifications`} className="view-notifications-btn">
                  View Updates
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentModules; 