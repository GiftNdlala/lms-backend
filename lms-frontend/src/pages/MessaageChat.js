import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './DashboardStyles.css';

const MessageChat = () => {
  const { id } = useParams(); // Extract subject ID from URL
  const [messages, setMessages] = useState([
    { sender: 'instructor', text: 'Welcome to the class!' },
    { sender: 'student', text: 'Thank you, excited to start!' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, { sender: 'student', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="dashboard-content chat-container">
      <h2 className="chat-header">Chat: {id.replace(/_/g, ' ')}</h2>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === 'student' ? 'chat-student' : 'chat-instructor'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default MessageChat;
