// src/pages/StudentCourseDetails.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './DashboardStyles.css';

const courseData = {
  1: {
    title: "Applied Renewable Energy",
    code: "ARE101",
    instructor: "Mr. Mokoena",
    content: [
      { type: "folder", title: "LEARNER GUIDE AND COURSE INFORMATION" },
      { type: "ebook", title: "Prescribed Book : e-Book" },
      {
        type: "unit",
        title: "Learning Unit 1: Solar Basics",
        description:
          "Understand solar power, basic concepts, installation methods, and safety procedures.",
      },
      {
        type: "unit",
        title: "Learning Unit 2: Photovoltaics",
        description:
          "Learn how photovoltaic systems work and how to troubleshoot common issues.",
      },
    ],
  },
  2: {
    title: "Solar Auditing",
    code: "SA202",
    instructor: "Ms. Dlamini",
    content: [
      { type: "folder", title: "AUDIT HANDBOOK & TOOLS" },
      { type: "ebook", title: "Energy Efficiency Guidebook" },
      {
        type: "unit",
        title: "Learning Unit 1: Site Assessment",
        description:
          "Conduct pre-installation energy audits and identify solar potential areas.",
      },
    ],
  },
  3: {
    title: "New Green Venture",
    code: "NGV303",
    instructor: "Dr. Khumalo",
    content: [
      { type: "folder", title: "BUSINESS PLANNING MATERIAL" },
      {
        type: "unit",
        title: "Learning Unit 1: Green Innovation",
        description:
          "Develop green business ideas and understand sustainability metrics.",
      },
    ],
  },
};

const StudentCourseDetails = () => {
  const { courseId } = useParams();
  const course = courseData[courseId];

  if (!course) return <div>Course not found.</div>;

  return (
    <div className="course-details-page">
      <h2>{course.code} - {course.title}</h2>

      <div className="course-top-nav">
        <span className="nav-link active-tab">Content</span>
        <Link to={`/dashboard/student/grades/details/${courseId}`} className="nav-link">Gradebook</Link>
        <Link to="/dashboard/student/messages" className="nav-link">Messages</Link>
        <Link to="/dashboard/student/announcements" className="nav-link">Announcements</Link>
        <Link to="/dashboard/student/ewallet" className="nav-link">🏆 Achievements</Link>
      </div>

      <div className="course-main">
        <div className="course-content">
          <h3>Course Content</h3>
          {course.content.map((item, index) => (
            <div className="content-box" key={index}>
              <h4>{item.title}</h4>
              {item.description && <p>{item.description}</p>}
            </div>
          ))}
        </div>

        <div className="course-side">
          <div className="course-faculty">
            <p className="label">Course Faculty</p>
            <div className="instructor-card">
              <div className="avatar-placeholder" />
              <div>
                <strong>{course.instructor}</strong>
                <p className="badge">Instructor</p>
              </div>
            </div>
          </div>
          <div className="details-actions">
            <p className="label">Details & Actions</p>
            <ul>
              <li><strong>Course Description:</strong> <Link>View</Link></li>
              <li><strong>Progress Tracking:</strong> On</li>
              <li><strong>Class Collaborate:</strong> <Link>Join session</Link></li>
              <li><strong>Attendance:</strong> <Link>View your attendance</Link></li>
              <li><strong>Course Achievements:</strong> <Link to="/dashboard/student/ewallet">View rewards</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <Link to="/dashboard/student/courses" className="back-link">← Back to Courses</Link>
    </div>
  );
};

export default StudentCourseDetails;

