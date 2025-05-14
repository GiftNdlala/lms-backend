import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentPages.css';
import studentApi from '../services/studentApi';

const StudentAnnouncement = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await studentApi.getAnnouncements();
        setAnnouncements(response);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        // Set default announcements if API call fails
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleMarkAsRead = async (announcementId) => {
    try {
      // Replace with actual API call
      await fetch(`/api/student/announcements/${announcementId}/read`, {
        method: 'POST',
      });

      // Update local state
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(announcement =>
          announcement.id === announcementId
            ? { ...announcement, unread: false }
            : announcement
        )
      );
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading announcements...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Announcements</h2>
        <p>Stay updated with important information from your modules</p>
      </div>

      <div className="announcements-list">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="announcement-card">
            <div className="announcement-header">
              <h3 className="announcement-title">{announcement.title}</h3>
              <span className="announcement-date">
                {new Date(announcement.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="announcement-content">
              <p>{announcement.content}</p>
            </div>

            <div className="announcement-footer">
              <div className="announcement-meta">
                <span>From: {announcement.sender_name}</span>
                <span>Module: {announcement.module_name}</span>
              </div>

              <div className="announcement-actions">
                {announcement.unread && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleMarkAsRead(announcement.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/dashboard/student/announcements/${announcement.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="empty-state">
            <p>No announcements at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncement; 