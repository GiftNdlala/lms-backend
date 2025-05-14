// src/pages/StudentLayout.js
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import LogoText from '../components/LogoText';

const StudentLayout = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/dashboard/student');
  };

  return (
    <div className="dashboard-container dark-theme">
      <aside className="sidebar">
        <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <LogoText variant="sidebar" />
        </div>
        <nav>
          <ul>
            <li><Link to="/dashboard/student">Dashboard</Link></li>
            <li><Link to="/dashboard/student/profile">Profile</Link></li>
            <li><Link to="/dashboard/student/modules">My Modules</Link></li>
            <li><Link to="/dashboard/student/grades">Grades</Link></li>
            <li><Link to="/dashboard/student/assessments">Assessments</Link></li>
            <li><Link to="/dashboard/student/announcements">Announcements</Link></li>
            <li><Link to="/dashboard/student/ewallet" className="achievement-link">🏆 Achievements</Link></li>
            <li><Link to="/logout" className="signout-link">🚪 Sign Out</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default StudentLayout;
