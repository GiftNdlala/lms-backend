import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import './InstructorStyles.css';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const roleData = localStorage.getItem('role_data');
        
        if (!token || !roleData) {
          navigate('/login/instructor');
          return;
        }

        const roleInfo = JSON.parse(roleData);
        if (roleInfo.role !== 'instructor') {
          navigate('/login/instructor');
          return;
        }

        const profileData = await instructorApi.getProfile();
        setProfile(profileData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          navigate('/login/instructor');
        } else {
          setError(error.message || 'Failed to load profile. Please try again.');
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [navigate]);

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
          <button onClick={() => navigate('/login/instructor')}>Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    
    <div className="dashboard-container">
      <div className="dashboard-header welcome-section">
        <h1>Welcome, {profile.user.first_name} {profile.user.last_name}</h1>
        <p>Email: {profile.user.email}</p>
        <p>Department: {profile.department}</p>
    </div>
      

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button onClick={() => navigate('/instructor/modules')}>Manage Modules</button>
            <button onClick={() => navigate('/instructor/assignments')}>Manage Assignments</button>
            <button onClick={() => navigate('/instructor/students')}>Manage Students</button>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {/* Add recent activity items here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard; 