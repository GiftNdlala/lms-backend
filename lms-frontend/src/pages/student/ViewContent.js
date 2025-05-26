import React, { useState } from 'react';
import './StudentStyles.css';

const mockModule = {
  title: 'New Venture Creation',
  code: 'NVC2025_1',
  instructor: 'TEVIN MEMLA',
  content: [
    {
      id: 1,
      title: 'LEARNER GUIDE AND COURSE INFORMATION',
      description: '',
      expanded: false,
    },
    {
      id: 2,
      title: 'Prescribed Book :e-Book',
      description: '',
      expanded: false,
    },
    {
      id: 3,
      title: 'Learning Unit 1: Java Inheritance',
      description: 'To learn about inheritance, implement subclasses that inherit and override superclass methods and understand the concept of polymorphism. To be familiar with the common superclass Object and its methods.',
      expanded: false,
    },
    {
      id: 4,
      title: 'Learning Unit 2: JDBC',
      description: '',
      expanded: false,
    },
  ],
};

const tabs = [
  'Content',
  'Calendar',
  'Announcements',
  'Discussions',
  'Gradebook',
  'Analytics',
  'Groups',
  'Achievements',
];

const ViewContent = () => {
  const [activeTab, setActiveTab] = useState('Content');
  const [content, setContent] = useState(mockModule.content);

  const toggleExpand = (id) => {
    setContent((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  return (
    <div className="view-content-container">
      <div className="module-header">
        <div>
          <div className="module-code">{mockModule.code}</div>
          <h2>{mockModule.title}</h2>
        </div>
        <button className="open-btn">OPEN</button>
      </div>
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Announcements' && <span className="badge">8</span>}
            {tab === 'Messages' && <span className="badge">4</span>}
          </div>
        ))}
      </div>
      <div className="main-content-area">
        <div className="course-content-section">
          <h3>Course Content</h3>
          {content.map((item) => (
            <div key={item.id} className="content-card">
              <div className="content-title" onClick={() => toggleExpand(item.id)}>
                <span className="icon">📄</span> {item.title}
                <span className="expand-icon">{item.expanded ? '▼' : '▶'}</span>
              </div>
              {item.expanded && item.description && (
                <div className="content-description">{item.description}</div>
              )}
            </div>
          ))}
        </div>
        <aside className="sidebar">
          <div className="faculty-section">
            <div className="faculty-avatar">SM</div>
            <div>
              <div className="faculty-name">{mockModule.instructor}</div>
              <div className="faculty-role">INSTRUCTOR</div>
            </div>
          </div>
          <div className="details-actions">
            <div className="action-item">
              <b>Course Description</b>
              <div><a href="javascript:void(0)">View the course description</a></div>
            </div>
            <div className="action-item">
              <b>Progress Tracking</b>
              <div>On</div>
            </div>
            <div className="action-item">
              <b>Class Collaborate</b>
              <div><a href="javascript:void(0)">Join session</a></div>
            </div>
            <div className="action-item">
              <b>Attendance</b>
              <div><a href="javascript:void(0)">View your attendance</a></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ViewContent; 