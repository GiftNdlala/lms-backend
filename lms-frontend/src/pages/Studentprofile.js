import React from 'react';
import './DashboardStyles.css';

function StudentProfile() {
  const student = {
    fullName: "Gift Ndlala",
    email: "221106189@edu.vut.ac.za",
    studentId: "221106189",
    gender: "Male",
    language: "System Default (English - United States)",
    privacy: "Only instructors can view my profile information",
    notifications: [
      "Stream notifications",
      "Email notifications",
      "Push notifications"
    ]
  };

  return (
    <div className="student-profile-wrapper">
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">
            <span>{student.fullName.charAt(0)}</span>
          </div>
          <div className="profile-details">
            <h2>{student.fullName}</h2>
            <p className="student-id">Student ID: {student.studentId}</p>
            <p className="student-email">{student.email}</p>
          </div>
        </div>

        <div className="profile-section">
          <h3>Basic Information</h3>
          <table className="profile-table">
            <tbody>
              <tr><td>Full Name</td><td>{student.fullName}</td></tr>
              <tr><td>Email</td><td>{student.email}</td></tr>
              <tr><td>Student ID</td><td>{student.studentId}</td></tr>
              <tr><td>Password</td><td><a href="#">Change password</a></td></tr>
              <tr><td>Gender</td><td>{student.gender}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="profile-section">
          <h3>System Settings</h3>
          <table className="profile-table">
            <tbody>
              <tr><td>Language</td><td>{student.language}</td></tr>
              <tr><td>Privacy</td><td>{student.privacy}</td></tr>
              <tr>
                <td>Notifications</td>
                <td>
                  {student.notifications.map((n, i) => (
                    <div key={i}><a href="#">{n}</a></div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
