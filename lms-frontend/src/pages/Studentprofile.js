import React, { useEffect, useState } from 'react';
import './DashboardStyles.css';
import studentApi from '../services/studentApi';

function StudentProfile() {
  const [profile, setProfile] = useState({
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
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await studentApi.getProfile();
        setProfile(response);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Set default profile data if API call fails
        setProfile({
          name: 'N/A',
          email: 'N/A',
          studentId: 'N/A',
          // Add other default fields as needed
        });
      }
    };

    fetchProfile();
  }, []);
  
  return (
    <div className="student-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            <span className="avatar-text">{profile.fullName ? profile.fullName.charAt(0) : '?'}</span>
          </div>
          <div className="student-info">
            <h2>{profile.fullName}</h2>
            <p className="student-id">Student ID: {profile.studentId}</p>
            <p className="student-email">{profile.email}</p>
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
                  <td>{profile.program}</td>
                </tr>
                <tr>
                  <td>Year of Study</td>
                  <td>{profile.yearOfStudy}</td>
                </tr>
                <tr>
                  <td>Enrollment Date</td>
                  <td>{profile.enrollmentDate}</td>
                </tr>
                <tr>
                  <td>Student ID</td>
                  <td>{profile.studentId}</td>
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
                  <td>{profile.fullName}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{profile.email}</td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td>{profile.gender}</td>
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
                  <td>{profile.language}</td>
                </tr>
                <tr>
                  <td>Privacy</td>
                  <td>{profile.privacy}</td>
                </tr>
                <tr>
                  <td>Notifications</td>
                  <td>
                    <div className="notification-links">
                      {(Array.isArray(profile.notifications) ? profile.notifications : []).map((notification, index) => (
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
