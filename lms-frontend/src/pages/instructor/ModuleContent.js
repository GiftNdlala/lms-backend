import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaFile, FaVideo, FaFileAudio, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaTrash } from 'react-icons/fa';
import instructorApi from '../../services/instructorApi';
import './ModuleContent.css';

const ModuleContent = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [contents, setContents] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const fetchModuleData = useCallback(async () => {
    try {
      const moduleData = await instructorApi.getModuleDetails(moduleId);
      setModule(moduleData);
      const contentData = await instructorApi.getModuleContent(moduleId);
      setContents(contentData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load module data' });
    }
  }, [moduleId]);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return <FaFilePdf />;
      case 'doc':
      case 'docx': return <FaFileWord />;
      case 'xls':
      case 'xlsx': return <FaFileExcel />;
      case 'ppt':
      case 'pptx': return <FaFilePowerpoint />;
      case 'mp4':
      case 'mov':
      case 'avi': return <FaVideo />;
      case 'mp3':
      case 'wav': return <FaFileAudio />;
      default: return <FaFile />;
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await instructorApi.addModuleContent(moduleId, formData);
      setMessage({ type: 'success', text: 'Files uploaded successfully' });
      fetchModuleData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload files' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await instructorApi.deleteModuleContent(moduleId, contentId);
      setMessage({ type: 'success', text: 'Content deleted successfully' });
      fetchModuleData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete content' });
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    try {
      await instructorApi.addModuleAnnouncement(moduleId, { text: newAnnouncement });
      setMessage({ type: 'success', text: 'Announcement posted successfully' });
      setNewAnnouncement('');
      fetchModuleData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to post announcement' });
    }
  };

  if (!module) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="module-content-page">
      <div className="module-header">
        <h1>{module.title}</h1>
        <p className="module-description">{module.description}</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="content-section">
        <div className="section-header">
          <h2>Course Content</h2>
          <div className="upload-container">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.wav"
            />
            <label htmlFor="file-upload" className="upload-button">
              {uploading ? 'Uploading...' : 'Upload Files'}
            </label>
          </div>
        </div>

        <div className="content-list">
          {contents.map((content) => (
            <div key={content.id} className="content-item">
              <div className="content-info">
                <span className="content-icon">
                  {getFileIcon(content.file_type)}
                </span>
                <div className="content-details">
                  <h3>{content.title}</h3>
                  <p>{content.description}</p>
                  <span className="content-meta">
                    {content.file_size} • {content.upload_date}
                  </span>
                </div>
              </div>
              <div className="content-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteContent(content.id)}
                  title="Delete content"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          {contents.length === 0 && (
            <div className="no-content">
              No content uploaded yet. Upload files to get started.
            </div>
          )}
        </div>
      </div>

      <div className="announcements-section">
        <h2>Module Announcements</h2>
        <form onSubmit={handleAnnouncementSubmit} className="announcement-form">
          <textarea
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Write an announcement..."
            rows="3"
          />
          <button type="submit" disabled={!newAnnouncement.trim()}>
            Post Announcement
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModuleContent; 