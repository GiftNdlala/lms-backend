import React from 'react';
import './StudentDashboard.css';

const TempStudentDashboard = () => {
  return (
    <div className="main-content">
      <header className="dashboard-header">
        <h2>Gift.., <span>Welcome back to the Dashboard!</span></h2>
        <p>Navigate Your Learning Path.</p>
      </header>

      <div className="card-container">
        <div className="card">
          <div className="icon">📚</div>
          <h3>CONTENT</h3>
          <p>Learner's Content</p>
          <button>ACCESS NOW</button>
        </div>
        <div className="card">
          <div className="icon">🗓️</div>
          <h3>COLLABORATION</h3>
          <p>Class Groups</p>
          <button>ACCESS NOW</button>
        </div>
        <div className="card">
          <div className="icon">🎓</div>
          <h3>Messages</h3>
          <p>Your Inbox</p>
          <button>ACCESS NOW</button>
        </div>
        <div className="card">
          <div className="icon">👥</div>
          <h3>Announcements</h3>
          <p>School Announcements</p>
          <button>ACCESS NOW</button>
        </div>
      </div>
    </div>
  );
};

export default TempStudentDashboard;
