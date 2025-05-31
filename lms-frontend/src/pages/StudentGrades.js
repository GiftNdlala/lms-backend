// src/pages/StudentGrades.js
import React, { useState, useEffect } from 'react';
import studentApi from '../services/studentApi';
import './StudentPages.css';

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'assignments', 'quizzes'

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const gradesRes = await studentApi.getGrades();
        // Flatten assignments and quizzes into a single array
        const allGrades = [];
        gradesRes.forEach(module => {
          // Assignments
          module.assignments.forEach(assignment => {
            allGrades.push({
              id: `assignment-${assignment.id}`,
              module_name: module.module_name,
              type: 'assignment',
              title: assignment.title,
              due_date: assignment.submitted_at || null,
              score: assignment.grade !== undefined && assignment.max_grade ? Math.round((assignment.grade / assignment.max_grade) * 100) : null,
              status: assignment.grade !== undefined ? 'Graded' : 'Pending'
            });
          });
          // Quizzes
          module.quizzes.forEach(quiz => {
            allGrades.push({
              id: `quiz-${quiz.id}`,
              module_name: module.module_name,
              type: 'quiz',
              title: quiz.title,
              due_date: quiz.attempted_at || null,
              score: quiz.score !== undefined && quiz.max_score ? Math.round((quiz.score / quiz.max_score) * 100) : null,
              status: quiz.score !== undefined ? 'Completed' : 'Pending'
            });
          });
        });
        setGrades(allGrades);
      } catch (error) {
        console.error('Error fetching grades:', error);
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

  const filteredGrades = grades.filter(grade => {
    if (filter === 'all') return true;
    if (filter === 'assignments') return grade.type === 'assignment';
    if (filter === 'quizzes') return grade.type === 'quiz';
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>My Grades</h2>
        <p>View your academic performance across all modules</p>
      </div>

      <div className="grades-container">
        <div className="grades-filter">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'assignments' ? 'active' : ''}`}
            onClick={() => setFilter('assignments')}
          >
            Assignments
          </button>
          <button 
            className={`filter-btn ${filter === 'quizzes' ? 'active' : ''}`}
            onClick={() => setFilter('quizzes')}
          >
            Quizzes
          </button>
        </div>

        <table className="grades-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Type</th>
              <th>Title</th>
              <th>Due Date</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading">Loading grades...</td>
              </tr>
            ) : filteredGrades.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-grades">No grades available yet.</td>
              </tr>
            ) : (
              filteredGrades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.module_name}</td>
                  <td>
                    <span className={`type-badge ${grade.type}`}>
                      {grade.type === 'quiz' ? 'Quiz' : 'Assignment'}
                    </span>
                  </td>
                  <td>{grade.title}</td>
                  <td>{grade.due_date ? new Date(grade.due_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={getGradeBadgeClass(grade.score)}>
                      {grade.score !== null ? `${grade.score}%` : 'N/A'}
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


