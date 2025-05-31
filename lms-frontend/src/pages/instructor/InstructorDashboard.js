import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instructorApi from '../../services/instructorApi';
import api from '../../services/api';
import dayjs from 'dayjs';
import './InstructorStyles.css';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ assignmentsToGrade: 0, newSubmissions: 0, ewalletChanges: 0 });

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
        // --- Fetch summary stats ---
        // 1. Assignments to grade & new submissions this week
        const modules = await instructorApi.getModules();
        let assignmentsToGrade = 0;
        let newSubmissions = 0;
        const now = dayjs();
        const weekAgo = now.subtract(7, 'day');
        for (const module of modules) {
          const assignmentsRes = await api.get(`/api/modules/instructor/modules/${module.id}/assignments/`);
          const assignments = assignmentsRes.data || [];
          for (const assignment of assignments) {
            if (assignment.submissions && Array.isArray(assignment.submissions)) {
              assignmentsToGrade += assignment.submissions.filter(s => s.status !== 'graded').length;
              newSubmissions += assignment.submissions.filter(s => s.submitted_at && dayjs(s.submitted_at).isAfter(weekAgo)).length;
            }
          }
        }
        // 2. E-wallet balance changes this week
        const transactionsRes = await api.get('/api/assessments/transactions/');
        const transactions = transactionsRes.data || [];
        const ewalletChanges = transactions.filter(t => t.date && dayjs(t.date).isAfter(weekAgo)).length;
        setStats({ assignmentsToGrade, newSubmissions, ewalletChanges });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) {
          navigate('/login/instructor');
        } else {
          setError(error.message || 'Failed to load dashboard. Please try again.');
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
          <h2>Summary Stats</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>📝 You have <b>{stats.assignmentsToGrade}</b> assignments to grade</li>
            <li>📥 <b>{stats.newSubmissions}</b> new student submissions this week</li>
            <li>💸 <b>{stats.ewalletChanges}</b> e-wallet balance changes this week</li>
          </ul>
        </div>
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button onClick={() => navigate('/dashboard/instructor/grade-students')}>Grade Students</button>
            <button onClick={() => navigate('/dashboard/instructor/ewallet')}>E-Wallet</button>
            <button onClick={() => navigate('/dashboard/instructor/announcements')}>Announcements</button>
            <button onClick={() => navigate('/dashboard/instructor/students')}>Manage Students</button>
            <button onClick={() => navigate('/dashboard/instructor/modules')}>Manage Modules</button>
            <button onClick={() => navigate('/dashboard/instructor/assignments')}>Manage Assignments</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard; 