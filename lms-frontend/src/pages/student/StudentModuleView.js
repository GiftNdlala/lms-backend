import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModuleById, getModuleContent } from '../../services/api';
import './StudentStyles.css';

const StudentModuleView = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [content, setContent] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchModuleData();
  }, [moduleId]);

  const fetchModuleData = async () => {
    try {
      const moduleData = await getModuleById(moduleId);
      setModule(moduleData);
      
      const contentData = await getModuleContent(moduleId);
      setContent(contentData);
      
      // Calculate progress
      const completedItems = contentData.filter(item => item.completed).length;
      setProgress((completedItems / contentData.length) * 100);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load module content');
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentItemIndex < content.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const markCompleted = async () => {
    try {
      const currentItem = content[currentItemIndex];
      // Update the completion status in the backend
      // This would need to be implemented in the API
      await updateContentProgress(moduleId, currentItem.id, true);
      
      // Update local state
      const updatedContent = [...content];
      updatedContent[currentItemIndex] = { ...currentItem, completed: true };
      setContent(updatedContent);
      
      // Update progress
      const completedItems = updatedContent.filter(item => item.completed).length;
      setProgress((completedItems / content.length) * 100);
    } catch (err) {
      setError('Failed to update progress');
    }
  };

  if (loading) return <div className="loading">Loading module content...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!module || content.length === 0) return <div className="error-message">No content available</div>;

  const currentContent = content[currentItemIndex];

  return (
    <div className="student-module-view">
      <div className="module-navigation">
        <button 
          className="secondary-button"
          onClick={() => navigate('/dashboard/student/modules')}
        >
          Back to Modules
        </button>
        <div className="module-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <div className="content-viewer">
        <h2>{module.title}</h2>
        <div className="content-navigation">
          <button
            className="nav-button"
            onClick={handlePrevious}
            disabled={currentItemIndex === 0}
          >
            Previous
          </button>
          <span>{currentItemIndex + 1} of {content.length}</span>
          <button
            className="nav-button"
            onClick={handleNext}
            disabled={currentItemIndex === content.length - 1}
          >
            Next
          </button>
        </div>

        <div className="content-container">
          <h3>{currentContent.title}</h3>
          <p className="content-description">{currentContent.description}</p>
          
          <div className="content-data">
            {currentContent.content_type === 'text' && (
              <div className="text-content">
                {currentContent.content_data}
              </div>
            )}
            {currentContent.content_type === 'video' && (
              <div className="video-container">
                <iframe
                  src={currentContent.content_data}
                  title={currentContent.title}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div className="content-actions">
            <button
              className="primary-button"
              onClick={markCompleted}
              disabled={currentContent.completed}
            >
              {currentContent.completed ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </div>

      <div className="content-outline">
        <h3>Content Outline</h3>
        <div className="outline-items">
          {content.map((item, index) => (
            <div
              key={item.id}
              className={`outline-item ${index === currentItemIndex ? 'active' : ''} ${item.completed ? 'completed' : ''}`}
              onClick={() => setCurrentItemIndex(index)}
            >
              <span className="item-number">{index + 1}</span>
              <span className="item-title">{item.title}</span>
              {item.completed && <span className="completion-mark">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentModuleView; 