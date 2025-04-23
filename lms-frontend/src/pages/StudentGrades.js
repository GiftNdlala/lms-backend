// src/pages/StudentGrades.js
import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardStyles.css';

const gradeData = [
  {
    id: 1,
    course: 'Applied Renawable Energy',
    grade: 'A',
    feedback: 'Excellent performance',
  },
  {
    id: 2,
    course: 'Solar Auditing',
    grade: 'B+',
    feedback: 'Great effort',
  },
  {
    id: 3,
    course: 'New Green Venture',
    grade: 'A-',
    feedback: 'Well done',
  },
];

const StudentGrades = () => {
  return (
    <div className="grades-container">
      <h2>📊 Grade Breakdown</h2>

      {gradeData.map((grade) => (
        <Link
          key={grade.id}
          to={`/dashboard/student/grades/details/${grade.id}`} // dynamic routing
          className="grade-card-link"
        >
          <div className="grade-card">
            <h3>{grade.course}</h3>
            <p><strong>Grade: {grade.grade}</strong></p>
            <p>{grade.feedback}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default StudentGrades;


