// src/pages/StudentCourses.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DashboardStyles.css';

const StudentCourses = () => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.courses.getEnrolledCourses();
        setEnrolledCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const calculateProgress = (course) => {
    if (!course.modules || course.modules.length === 0) return 0;
    const completedModules = course.modules.filter(module => module.completed).length;
    return Math.round((completedModules / course.modules.length) * 100);
  };

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h2>My Courses</h2>
        <div className="courses-stats">
          <div className="stat-box">
            <span className="stat-number">{enrolledCourses.length}</span>
            <span className="stat-label">Enrolled Courses</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">
              {enrolledCourses.filter(course => calculateProgress(course) === 100).length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="courses-grid">
        {enrolledCourses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3>{course.title}</h3>
              <span className="course-code">{course.code}</span>
            </div>
            
            <div className="course-info">
              <p>{course.description}</p>
              <div className="course-meta">
                <span>Instructor: {course.instructor_name}</span>
                <span>Start Date: {new Date(course.start_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="course-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${calculateProgress(course)}%` }}
                />
              </div>
              <span className="progress-text">{calculateProgress(course)}% Complete</span>
            </div>

            <div className="course-actions">
              <button 
                className="primary-button"
                onClick={() => navigate(`/dashboard/student/courses/${course.id}`)}
              >
                View Course
              </button>
              <button 
                className="secondary-button"
                onClick={() => navigate(`/dashboard/student/courses/${course.id}/modules`)}
              >
                View Modules
              </button>
            </div>
          </div>
        ))}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="empty-state">
          <h3>No Courses Found</h3>
          <p>You are not enrolled in any courses yet.</p>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
