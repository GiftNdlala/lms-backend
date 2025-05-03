import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/studentApi';
import { FaBook, FaTasks, FaGraduationCap, FaBell, FaWallet } from 'react-icons/fa';
import './StudentStyles.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login/student');
          return;
        }

        await Promise.all([
          fetchProfile(),
          fetchModules(),
          fetchAssignments(),
          fetchGrades(),
          fetchAnnouncements()
        ]);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('access_token');
        navigate('/login/student');
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const response = await studentApi.getProfile();
      setProfile(response);
    } catch (err) {
      console.error('Error fetching profile:', err);
      throw err;
    }
  };

  const fetchModules = async () => {
    try {
      const response = await studentApi.getModules();
      setModules(response);
    } catch (err) {
      console.error('Error fetching modules:', err);
      throw err;
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await studentApi.getAssignments();
      setAssignments(response);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      throw err;
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await studentApi.getGrades();
      setGrades(response);
    } catch (err) {
      console.error('Error fetching grades:', err);
      throw err;
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await studentApi.getAnnouncements();
      setAnnouncements(response);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login/student')}>Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {profile?.first_name} {profile?.last_name}</h1>
        <div className="profile-info">
          <p>Student ID: {profile?.student_id}</p>
          <p>Program: {profile?.program}</p>
          <p>Batch: {profile?.batch}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="stats-card">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <FaBook />
              <span>{modules.length} Modules</span>
            </div>
            <div className="stat-item">
              <FaTasks />
              <span>{assignments.length} Assignments</span>
            </div>
            <div className="stat-item">
              <FaGraduationCap />
              <span>GPA: {calculateGPA(grades)}</span>
            </div>
          </div>
        </div>

        {/* Recent Modules */}
        <div className="modules-card">
          <h2>Recent Modules</h2>
          <div className="modules-list">
            {modules.slice(0, 3).map(module => (
              <div key={module.id} className="module-item" onClick={() => navigate(`/student/modules/${module.id}`)}>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-progress">
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${module.progress || 0}%` }}></div>
                  </div>
                  <span>{module.progress || 0}% Complete</span>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all" onClick={() => navigate('/student/modules')}>
            View All Modules
          </button>
        </div>

        {/* Upcoming Assignments */}
        <div className="assignments-card">
          <h2>Upcoming Assignments</h2>
          <div className="assignments-list">
            {assignments
              .filter(assignment => new Date(assignment.due_date) > new Date())
              .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
              .slice(0, 3)
              .map(assignment => (
                <div key={assignment.id} className="assignment-item">
                  <h3>{assignment.title}</h3>
                  <p>Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                  <div className="assignment-status">
                    {assignment.submitted ? (
                      <span className="submitted">Submitted</span>
                    ) : (
                      <span className="pending">Pending</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <button className="view-all" onClick={() => navigate('/student/assignments')}>
            View All Assignments
          </button>
        </div>

        {/* Recent Announcements */}
        <div className="announcements-card">
          <h2>Recent Announcements</h2>
          <div className="announcements-list">
            {announcements.slice(0, 3).map(announcement => (
              <div key={announcement.id} className="announcement-item">
                <h3>{announcement.title}</h3>
                <p>{announcement.content}</p>
                <span className="announcement-date">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          <button className="view-all" onClick={() => navigate('/student/announcements')}>
            View All Announcements
          </button>
        </div>
      </div>
    </div>
  );
};

const calculateGPA = (grades) => {
  if (!grades || !grades.length) return 'N/A';
  const total = grades.reduce((sum, grade) => sum + grade.score, 0);
  return (total / grades.length).toFixed(2);
};

export default StudentDashboard; 