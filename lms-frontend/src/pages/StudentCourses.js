// src/pages/StudentCourses.js
import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardStyles.css'; // Assuming you're using your central CSS

const courses = [
  {
    id: 1,
    title: "Applied Renewable Energy",
    instructor: "Mr. Mokoena",
    duration: "12 weeks",
    description: "Learn the basics and applications of renewable energy systems.",
  },
  {
    id: 2,
    title: "Solar Auditing",
    instructor: "Ms. Dlamini",
    duration: "8 weeks",
    description: "Master the art of auditing and optimizing solar installations.",
  },
  {
    id: 3,
    title: "New Green Venture",
    instructor: "Dr. Khumalo",
    duration: "10 weeks",
    description: "Explore entrepreneurship in the green energy space.",
  },
];

const StudentCourses = () => {
  return (
    <div className="courses-page">
      <h2>📘 My Courses</h2>
      <div className="course-card-container">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p><strong>Instructor:</strong> {course.instructor}</p>
            <p><strong>Duration:</strong> {course.duration}</p>
            <p>{course.description}</p>

            {/* ✅ Link to Course Details Page */}
            <Link to={`/dashboard/student/courses/${course.id}`}>
              <button className="course-button">View Course</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;
