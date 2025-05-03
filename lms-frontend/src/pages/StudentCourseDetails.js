// src/pages/StudentCourseDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DashboardStyles.css';

const StudentCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignmentList, setAssignmentList] = useState([]);
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, modulesRes, assignmentsRes, gradesRes] = await Promise.all([
          api.courses.getCourse(courseId),
          api.courses.getModules(courseId),
          api.assignments.list(courseId),
          api.grades.getCourseGrades(courseId)
        ]);

        setCourse(courseRes.data);
        setModules(modulesRes.data);
        setAssignmentList(assignmentsRes.data);
        setGradeData(gradesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load course data');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const calculateOverallProgress = () => {
    if (!modules.length) return 0;
    const completedModules = modules.filter(module => module.completed).length;
    return Math.round((completedModules / modules.length) * 100);
  };

  if (loading) return <div className="loading">Loading course details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return <div className="error-message">Course not found</div>;

  return (
    <div className="course-details-container">
      <div className="course-header">
        <div className="course-title">
          <h2>{course.title}</h2>
          <span className="course-code">{course.code}</span>
        </div>
        <div className="course-meta">
          <span>Instructor: {course.instructor_name}</span>
          <span>Start Date: {new Date(course.start_date).toLocaleDateString()}</span>
          <span>End Date: {new Date(course.end_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="course-progress-section">
        <h3>Course Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${calculateOverallProgress()}%` }}
          />
        </div>
        <span className="progress-text">{calculateOverallProgress()}% Complete</span>
      </div>

      <div className="course-content-grid">
        <div className="content-section modules-section">
          <h3>Modules</h3>
          <div className="modules-list">
            {modules.map((module) => (
              <div key={module.id} className="module-card">
                <div className="module-info">
                  <h4>{module.title}</h4>
                  <p>{module.description}</p>
                </div>
                <div className="module-status">
                  {module.completed ? (
                    <span className="status-badge completed">Completed</span>
                  ) : (
                    <button 
                      className="primary-button"
                      onClick={() => navigate(`/dashboard/student/courses/${courseId}/modules/${module.id}`)}
                    >
                      Start Module
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section assignments-section">
          <h3>Assignments</h3>
          <div className="assignments-list">
            {assignmentList.map((assignment) => (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-info">
                  <h4>{assignment.title}</h4>
                  <p>{assignment.description}</p>
                  <div className="assignment-meta">
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    <span>Points: {assignment.points}</span>
                  </div>
                </div>
                <div className="assignment-status">
                  {assignment.submitted ? (
                    <span className="status-badge submitted">Submitted</span>
                  ) : (
                    <button 
                      className="primary-button"
                      onClick={() => navigate(`/dashboard/student/courses/${courseId}/assignments/${assignment.id}`)}
                    >
                      Submit Assignment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {gradeData && (
          <div className="content-section grades-section">
            <h3>Grades</h3>
            <div className="grades-summary">
              <div className="grade-item">
                <span>Overall Grade</span>
                <span className="grade">{gradeData.overall_grade || 'N/A'}</span>
              </div>
              <div className="grade-item">
                <span>Assignments Average</span>
                <span className="grade">{gradeData.assignments_average || 'N/A'}</span>
              </div>
              <div className="grade-item">
                <span>Quizzes Average</span>
                <span className="grade">{gradeData.quizzes_average || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseDetails;

