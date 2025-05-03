import React from 'react';
import './DashboardStyles.css';

function StudentProfile() {
  const student = {
    fullName: "Gift Ndlala",
    email: "gift14@gmail.com",
    studentId: "22110618",
    gender: "Male",
    program: "Renewable Energy Technology",
    yearOfStudy: "2nd Year",
    enrollmentDate: "2023",
    language: "System Default (English - United States)",
    privacy: "Only instructors can view my profile information",
    notifications: [
      "Stream notifications",
      "Email notifications",
      "Push notifications"
    ]
  };

  return (
    <div className="student-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            <span className="avatar-text">{student.fullName.charAt(0)}</span>
          </div>
          <div className="student-info">
            <h2>{student.fullName}</h2>
            <p className="student-id">Student ID: {student.studentId}</p>
            <p className="student-email">{student.email}</p>
            <div className="read-only-notice">
              <i className="info-icon">ℹ</i>
              <span>Profile information can only be updated by your instructor. Contact them for any changes needed.</span>
            </div>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3>Academic Information</h3>
            <table className="profile-table read-only">
              <tbody>
                <tr>
                  <td>Program</td>
                  <td>{student.program}</td>
                </tr>
                <tr>
                  <td>Year of Study</td>
                  <td>{student.yearOfStudy}</td>
                </tr>
                <tr>
                  <td>Enrollment Date</td>
                  <td>{student.enrollmentDate}</td>
                </tr>
                <tr>
                  <td>Student ID</td>
                  <td>{student.studentId}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="profile-section">
            <h3>Personal Information</h3>
            <table className="profile-table read-only">
              <tbody>
                <tr>
                  <td>Full Name</td>
                  <td>{student.fullName}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{student.email}</td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td>{student.gender}</td>
                </tr>
                <tr>
                  <td>Password</td>
                  <td>
                    <button className="change-password-btn">
                      Change Password
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="profile-section">
            <h3>System Preferences</h3>
            <table className="profile-table">
              <tbody>
                <tr>
                  <td>Language</td>
                  <td>{student.language}</td>
                </tr>
                <tr>
                  <td>Privacy</td>
                  <td>{student.privacy}</td>
                </tr>
                <tr>
                  <td>Notifications</td>
                  <td>
                    <div className="notification-links">
                      {student.notifications.map((notification, index) => (
                        <label key={index} className="notification-toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="notification-label">{notification}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
