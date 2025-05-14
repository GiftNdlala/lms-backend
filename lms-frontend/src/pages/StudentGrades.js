// src/pages/StudentGrades.js
import React, { useState, useEffect } from 'react';
import studentApi from '../services/studentApi';
import './StudentPages.css';

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await studentApi.getGrades();
        setGrades(response);
      } catch (error) {
        console.error('Error fetching grades:', error);
        // Set default grades if API call fails
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const getGradeBadgeClass = (grade) => {
    if (grade >= 90) return 'grade-badge grade-a';
    if (grade >= 80) return 'grade-badge grade-b';
    if (grade >= 70) return 'grade-badge grade-c';
    return 'grade-badge grade-d';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>My Grades</h2>
        <p>View your academic performance across all modules</p>
      </div>

      <div className="grades-container">
        <table className="grades-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Assignment</th>
              <th>Due Date</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading">Loading grades...</td>
              </tr>
            ) : grades.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-grades">No grades available yet.</td>
              </tr>
            ) : (
              grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.module_name}</td>
                  <td>{grade.assignment_name}</td>
                  <td>{new Date(grade.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className={getGradeBadgeClass(grade.score)}>
                      {grade.score}%
                    </span>
                  </td>
                  <td>{grade.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentGrades;


