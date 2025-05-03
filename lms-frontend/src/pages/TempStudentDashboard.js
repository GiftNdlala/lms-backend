import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses, auth } from '../services/api';
import './StudentDashboard.css';

const TempStudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentModules, setRecentModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userResponse = await auth.getCurrentUser();
        setUser(userResponse.data);

        // Fetch enrolled courses
        const coursesResponse = await courses.list();
        setEnrolledCourses(coursesResponse.data);

        // Fetch recent modules (assuming this endpoint exists)
        const modulesResponse = await courses.getRecentModules();
        setRecentModules(modulesResponse.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="main-content">
      <header className="dashboard-header">
        <h2>Welcome back, <span>{user?.first_name || 'Student'}!</span></h2>
        <p className="subtitle">Here's an overview of your learning progress</p>
      </header>

      <div className="dashboard-grid">
        <section className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>{enrolledCourses.length}</h3>
              <p>Enrolled Courses</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h3>{recentModules.length}</h3>
              <p>Active Modules</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{recentModules.filter(m => m.completed).length}</h3>
              <p>Completed Modules</p>
            </div>
          </div>
        </section>

        <section className="recent-modules">
          <div className="section-header">
            <h3>Recent Modules</h3>
            <button className="view-all" onClick={() => navigate('/dashboard/student/modules')}>
              View All Modules
            </button>
          </div>
          <div className="modules-grid">
            {recentModules.slice(0, 3).map((module) => (
              <div key={module.id} className="module-card">
                <div className="module-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${module.progress || 0}%` }}
                    />
                  </div>
                  <span>{module.progress || 0}%</span>
                </div>
                <h4>{module.title}</h4>
                <p>{module.description}</p>
                <button 
                  className="continue-btn"
                  onClick={() => navigate(`/dashboard/student/modules/${module.id}`)}
                >
                  Continue Learning
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="enrolled-courses">
          <div className="section-header">
            <h3>My Courses</h3>
            <button className="view-all" onClick={() => navigate('/dashboard/student/courses')}>
              View All Courses
            </button>
          </div>
          <div className="courses-grid">
            {enrolledCourses.slice(0, 4).map((course) => (
              <div key={course.id} className="course-card">
                <h4>{course.title}</h4>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span>Instructor: {course.instructor_name}</span>
                  <span>{course.credits} Credits</span>
                </div>
                <button 
                  className="view-course-btn"
                  onClick={() => navigate(`/dashboard/student/courses/${course.id}`)}
                >
                  View Course
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TempStudentDashboard;
