import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../DashboardStyles.css';
import './ModuleStyles.css';

function ModuleDetails({ activeTab: initialActiveTab }) {
  const { moduleId } = useParams();
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'content');
  const [newMessage, setNewMessage] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);

  // Set active tab when initialActiveTab prop changes
  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  // Example data - In real application, this would come from an API
  const moduleData = {
    id: moduleId,
    title: "Introduction to Programming",
    instructor: "Dr. Smith",
    code: "CSC101",
    description: "Learn the fundamentals of programming using Python",
    content: [
      {
        id: 1,
        title: "Week 1: Introduction to Python",
        type: "lecture",
        files: ["lecture1.pdf", "examples.py"],
        uploadedDate: "2024-03-15"
      },
      // More content items would be here
    ],
    assignments: [
      {
        id: 1,
        title: "Python Basics Assignment",
        dueDate: "2024-03-25",
        status: "pending",
        points: 100
      },
      // More assignments would be here
    ],
    tests: [
      {
        id: 1,
        title: "Mid-term Test",
        date: "2024-04-10",
        duration: "2 hours",
        status: "upcoming"
      },
      // More tests would be here
    ],
    notifications: [
      {
        id: 1,
        title: "Assignment 1 Due Date Extended",
        date: "2024-03-18",
        content: "The due date for Assignment 1 has been extended to March 30th.",
        comments: [
          {
            id: 1,
            user: "Student",
            text: "Thank you for the extension!",
            timestamp: "2024-03-18 14:30"
          }
        ]
      },
      // More notifications would be here
    ],
    grades: [
      {
        id: 1,
        title: "Assignment 1",
        score: 85,
        maxScore: 100,
        feedback: "Good work! Need more comments in code."
      },
      // More grades would be here
    ]
  };

  const handleNewComment = (notificationId) => {
    // Handle adding new comment
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Handle sending message to instructor
    setNewMessage('');
    setShowMessageForm(false);
  };

  return (
    <div className="module-details-container">
      <div className="module-header">
        <div className="module-title">
          <h1>{moduleData.title}</h1>
          <span className="module-code">{moduleData.code}</span>
        </div>
        <div className="module-instructor">
          <p>Instructor: {moduleData.instructor}</p>
          <button 
            className="contact-instructor-btn"
            onClick={() => setShowMessageForm(true)}
          >
            Contact Instructor
          </button>
        </div>
      </div>

      {showMessageForm && (
        <div className="message-form-overlay">
          <div className="message-form">
            <h3>Message to Instructor</h3>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            <div className="message-form-actions">
              <button onClick={handleSendMessage}>Send Message</button>
              <button onClick={() => setShowMessageForm(false)}>Cancel</button>
            </div>
          </div>
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
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments & Tests
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          Grades
        </button>
      </div>

      <div className="module-content">
        {activeTab === 'content' && (
          <div className="content-section">
            {moduleData.content.map(item => (
              <div key={item.id} className="content-item">
                <h3>{item.title}</h3>
                <div className="content-files">
                  {item.files.map((file, index) => (
                    <a key={index} href={`#download-${file}`} className="file-link">
                      {file}
                    </a>
                  ))}
                </div>
                <span className="upload-date">Uploaded: {item.uploadedDate}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="assignments-section">
            <div className="upcoming-tests">
              <h2>Upcoming Tests</h2>
              {moduleData.tests.map(test => (
                <div key={test.id} className="test-item">
                  <h3>{test.title}</h3>
                  <p>Date: {test.date}</p>
                  <p>Duration: {test.duration}</p>
                  <span className={`status ${test.status}`}>{test.status}</span>
                </div>
              ))}
            </div>

            <div className="assignments-list">
              <h2>Assignments</h2>
              {moduleData.assignments.map(assignment => (
                <div key={assignment.id} className="assignment-item">
                  <h3>{assignment.title}</h3>
                  <p>Due Date: {assignment.dueDate}</p>
                  <p>Points: {assignment.points}</p>
                  <span className={`status ${assignment.status}`}>
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-section">
            {moduleData.notifications.map(notification => (
              <div key={notification.id} className="notification-item">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-date">{notification.date}</span>
                </div>
                <p>{notification.content}</p>
                <div className="notification-comments">
                  {notification.comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <span className="comment-user">{comment.user}</span>
                      <p>{comment.text}</p>
                      <span className="comment-time">{comment.timestamp}</span>
                    </div>
                  ))}
                  <div className="add-comment">
                    <textarea 
                      placeholder="Add a comment..."
                      onChange={(e) => handleNewComment(notification.id, e.target.value)}
                    />
                    <button onClick={() => handleNewComment(notification.id)}>
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="grades-section">
            {moduleData.grades.map(grade => (
              <div key={grade.id} className="grade-item">
                <h3>{grade.title}</h3>
                <div className="grade-score">
                  <span className="score">{grade.score}</span>
                  <span className="max-score">/ {grade.maxScore}</span>
                </div>
                <p className="feedback">{grade.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModuleDetails; 