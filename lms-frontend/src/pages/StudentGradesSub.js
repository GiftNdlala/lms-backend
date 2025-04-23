// src/pages/StudentGradesSub.js
import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardStyles.css';

const gradeItems = [
  {
    item: 'Weighted Total',
    description: 'View Description',
    criteria: 'Grading Criteria',
    lastActivity: '',
    grade: '-',
  },
  {
    item: 'Total',
    description: 'View Description',
    criteria: 'Grading Criteria',
    lastActivity: '',
    grade: '-',
  },
  {
    item: 'Attendance',
    description: 'Attendance',
    criteria: '',
    lastActivity: 'UPCOMING',
    grade: '- /100',
  },
];

const StudentGradesSub = () => {
  return (
    <div className="grades-container">
      <h2>📊 My Grades</h2>

      {/* Tabs (not functional yet) */}
      <div className="tabs">
        <button className="tab active">All</button>
        <button className="tab">Graded</button>
        <button className="tab">Upcoming</button>
        <button className="tab">Submitted</button>

        <div className="order-select">
          Order by: <select>
            <option>Due Date (Latest First)</option>
            <option>Due Date (Earliest First)</option>
          </select>
        </div>
      </div>

      {/* Grades Table */}
      <div className="grades-table">
        <div className="grades-header">
          <span>ITEM</span>
          <span>LAST ACTIVITY</span>
          <span>GRADE</span>
        </div>

        {gradeItems.map((g, i) => (
          <div className="grades-row" key={i}>
            <div className="item-info">
              <strong>{g.item}</strong>
              <div className="sub-links">
                {g.description && <span className="link">{g.description}</span>}
                {g.criteria && <span className="link">{g.criteria}</span>}
              </div>
            </div>
            <div className="last-activity">{g.lastActivity}</div>
            <div className="grade">{g.grade}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/dashboard/student/grades">
          <button className="view-details-btn">⬅ Back to Courses</button>
        </Link>
      </div>
    </div>
  );
};

export default StudentGradesSub;

