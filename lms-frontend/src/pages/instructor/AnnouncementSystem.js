import React, { useState, useEffect } from 'react';
import './AnnouncementSystem.css';
import instructorApi from '../../services/instructorApi';

const AnnouncementSystem = () => {
  // Mock data for courses - TODO: Replace with API call
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await instructorApi.getModules();
        setModules(data);
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };
    fetchModules();
  }, []);

  // Mock data for announcements - TODO: Replace with API call
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Important Course Update',
      message: 'The deadline for Project 1 has been extended to next Friday.',
      courseId: 1,
      date: '2024-04-25'
    },
    {
      id: 2,
      title: 'New Module Available',
      message: 'The new module on React Hooks is now available. Please complete it by next week.',
      courseId: 2,
      date: '2024-04-24'
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    courseId: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // TODO: Replace with actual API call
      if (editingId) {
        // Update existing announcement
        setAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === editingId
              ? { ...formData, id: editingId, date: new Date().toISOString().split('T')[0] }
              : announcement
          )
        );
        setMessage('Announcement updated successfully!');
      } else {
        // Create new announcement
        const newAnnouncement = {
          ...formData,
          id: announcements.length + 1,
          date: new Date().toISOString().split('T')[0]
        };
        setAnnouncements(prev => [...prev, newAnnouncement]);
        setMessage('Announcement created successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        message: '',
        courseId: ''
      });
      setEditingId(null);
    } catch (error) {
      setMessage('Error saving announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      courseId: announcement.courseId
    });
    setEditingId(announcement.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
        setMessage('Announcement deleted successfully!');
      } catch (error) {
        setMessage('Error deleting announcement. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="announcement-system">
      <h1>Announcement System</h1>

      <div className="announcement-form">
        <h2>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="courseId">Select Module</label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">Select a module</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (editingId ? 'Update Announcement' : 'Create Announcement')}
          </button>
        </form>
      </div>

      <div className="announcements-list">
        <h2>Previous Announcements</h2>
        
        {announcements.map(announcement => (
          <div key={announcement.id} className="announcement-card">
            <div className="announcement-header">
              <h3>{announcement.title}</h3>
              <div className="announcement-actions">
                <button 
                  onClick={() => handleEdit(announcement)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(announcement.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="announcement-meta">
              <span className="course">
                {modules.find(m => m.id === Number(announcement.courseId))?.title}
              </span>
              <span className="date">{announcement.date}</span>
            </div>
            
            <div className="announcement-message">
              {announcement.message}
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AnnouncementSystem; 