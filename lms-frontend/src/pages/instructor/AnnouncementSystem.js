import React, { useState, useEffect } from 'react';
import './AnnouncementSystem.css';
import instructorApi from '../../services/instructorApi';

const AnnouncementSystem = () => {
  const [modules, setModules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    module: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    if (formData.module) {
      fetchAnnouncements(formData.module);
    }
  }, [formData.module]);

  const fetchAnnouncements = async (moduleId) => {
    setLoading(true);
    try {
      const data = await instructorApi.getModuleNotifications(moduleId);
      setAnnouncements(data);
    } catch (error) {
      setMessage('Error fetching announcements.');
    } finally {
      setLoading(false);
    }
  };

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
      if (editingId) {
        await instructorApi.updateModuleNotification(formData.module, editingId, formData);
        setMessage('Announcement updated successfully!');
      } else {
        await instructorApi.createModuleNotification(formData.module, formData);
        setMessage('Announcement created successfully!');
      }
      setFormData({ title: '', content: '', module: '' });
      setEditingId(null);
      if (formData.module) {
        fetchAnnouncements(formData.module);
      }
    } catch (error) {
      setMessage('Error saving announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      module: announcement.module
    });
    setEditingId(announcement.id);
  };

  const handleDelete = async (moduleId, id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setLoading(true);
      try {
        await instructorApi.deleteModuleNotification(moduleId, id);
        setMessage('Announcement deleted successfully!');
        fetchAnnouncements(moduleId);
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
            <label htmlFor="module">Select Module</label>
            <select
              id="module"
              name="module"
              value={formData.module}
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
            <label htmlFor="content">Message</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
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
                  onClick={() => handleDelete(formData.module, announcement.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="announcement-meta">
              <span className="module">
                {modules.find(m => m.id === Number(announcement.module))?.title || announcement.module_title}
              </span>
              <span className="date">{new Date(announcement.created_at).toLocaleDateString()}</span>
            </div>
            <div className="announcement-message">
              {announcement.content}
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