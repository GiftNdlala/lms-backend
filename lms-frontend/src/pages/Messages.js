import React, { useState, useEffect } from 'react';
import studentApi from '../services/studentApi';
import './StudentPages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await studentApi.getMessages();
        setMessages(data);
      } catch (err) {
        setError('Failed to load messages. Please try again later.');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const fetchMessageThread = async () => {
      if (selectedMessage) {
        try {
          const threadData = await studentApi.getMessageThread(selectedMessage.id);
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const index = updatedMessages.findIndex(m => m.id === selectedMessage.id);
            if (index !== -1) {
              updatedMessages[index] = { ...updatedMessages[index], messages: threadData.messages };
            }
            return updatedMessages;
          });
        } catch (err) {
          console.error('Error fetching message thread:', err);
        }
      }
    };

    fetchMessageThread();
  }, [selectedMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMessage) return;

    try {
      const response = await studentApi.sendMessage(selectedMessage.id, newMessage);
      
      // Update messages list with the new message
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const messageIndex = updatedMessages.findIndex(m => m.id === selectedMessage.id);
        if (messageIndex !== -1) {
          updatedMessages[messageIndex].messages = [
            ...updatedMessages[messageIndex].messages,
            response.message
          ];
          updatedMessages[messageIndex].last_message = newMessage;
          updatedMessages[messageIndex].last_message_time = new Date().toISOString();
        }
        return updatedMessages;
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Messages</h2>
        <p>Chat with your instructors and classmates</p>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${selectedMessage?.id === message.id ? 'active' : ''}`}
              onClick={() => setSelectedMessage(message)}
            >
              <div className="message-preview">
                <div className="message-avatar">
                  {message.sender_name.charAt(0)}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <strong>{message.sender_name}</strong>
                    <span className="message-time">
                      {new Date(message.last_message_time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-preview-text">
                    {message.last_message}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="empty-state">
              <p>No messages yet.</p>
            </div>
          )}
        </div>

        <div className="chat-area">
          {selectedMessage ? (
            <>
              <div className="chat-messages">
                {selectedMessage.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.sender === 'me' ? 'chat-message-sent' : 'chat-message-received'}`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
