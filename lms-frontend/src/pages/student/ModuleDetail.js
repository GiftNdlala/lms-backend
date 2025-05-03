import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFile, FaVideo, FaFileAudio, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaDownload } from 'react-icons/fa';
import api from '../../services/api';
import './ModuleDetail.css';

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [contents, setContents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    fetchModuleData();
  }, [moduleId]);

  const fetchModuleData = async () => {
    try {
      const [moduleData, contentData, announcementsData] = await Promise.all([
        api.student.getModuleDetails(moduleId),
        api.student.getModuleContent(moduleId),
        api.student.getModuleAnnouncements(moduleId)
      ]);

      setModule(moduleData);
      setContents(contentData);
      setAnnouncements(announcementsData);
    } catch (error) {
      setMessage('Failed to load module data');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDownload = async (contentId, fileName) => {
    try {
      const response = await api.student.downloadContent(moduleId, contentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage('Failed to download file');
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.student.sendModuleMessage(moduleId, { message: newMessage });
      setNewMessage('');
      setMessage('Message sent successfully');
    } catch (error) {
      setMessage('Failed to send message');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!module) {
    return <div className="error">Module not found</div>;
  }

  return (
    <div className="module-detail-page">
      <div className="module-header">
        <h1>{module.title}</h1>
        <p className="module-description">{module.description}</p>
      </div>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <div className="module-tabs">
        <button 
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button 
          className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          Discussion
        </button>
        <button 
          className={`tab ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          Quizzes
        </button>
      </div>

      <div className="module-content">
        {activeTab === 'content' && (
          <div className="content-section">
            <h2>Course Materials</h2>
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
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(content.id, content.title)}
                    title="Download file"
                  >
                    <FaDownload />
                  </button>
                </div>
              ))}
              {contents.length === 0 && (
                <div className="no-content">
                  No content available for this module yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="announcements-section">
            <h2>Announcements</h2>
            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-item">
                  <div className="announcement-header">
                    <span className="announcement-date">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="announcement-content">
                    {announcement.text}
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="no-announcements">
                  No announcements for this module yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="quizzes-section">
            <h2>Available Quizzes</h2>
            <button 
              className="btn-primary"
              onClick={() => navigate(`/dashboard/student/modules/${moduleId}/quiz`)}
            >
              View Quizzes
            </button>
          </div>
        )}

        <div className="message-section">
          <h2>Message Instructor</h2>
          <form onSubmit={handleMessageSubmit} className="message-form">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              rows="4"
            />
            <button type="submit" disabled={!newMessage.trim()}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail; 