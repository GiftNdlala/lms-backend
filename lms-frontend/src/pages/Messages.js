import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardStyles.css';

const dummyMessages = [
  {
    id: 'RE',
    title: 'Applied Renewable Energy',
    unreadCount: 4
  },
  {
    id: 'P1',
    title: 'Plumbing 1.1',
    unreadCount: 3
  },
  {
    id: 'S-A',
    title: 'Solar Auditing 1.1',
    unreadCount: 0
  },
  {
    id: 'GV1',
    title: 'Green Venture 1.1',
    unreadCount: 0
  }
];

const Messages = () => {
  const navigate = useNavigate();

  const handleOpenChat = (id) => {
    navigate(`/dashboard/student/messages/chat/${id}`);
  };

  return (
    <div className="dashboard-content">
      <h2 className="dashboard-title">Messages</h2>
      {dummyMessages.map((msg, index) => (
        <div key={index} className="message-card">
          <div>
            <p className="msg-id">ID: {msg.id}</p>
            <p className="msg-title">
              <span
                className="msg-clickable"
                onClick={() => handleOpenChat(msg.id)}
              >
                {msg.title}
              </span>
              {msg.unreadCount > 0 && (
                <span className="unread-count">{msg.unreadCount}</span>
              )}
            </p>
          </div>
          <div className="message-right">
            <span className="new-msg">📧 New Message</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Messages;
