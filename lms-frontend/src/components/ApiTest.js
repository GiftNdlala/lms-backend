import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [backendInfo, setBackendInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    
    try {
      setStatus('Connecting to backend...');
      
      // Test basic connection
      const response = await axios.get(`${apiUrl}/admin/`, {
        timeout: 10000,
        validateStatus: function (status) {
          // Accept any status code (even 404) as it means the server is responding
          return status < 500;
        }
      });
      
      setStatus('✅ Backend Connection Successful!');
      setBackendInfo({
        url: apiUrl,
        status: response.status,
        message: 'Backend is running and responding'
      });
      
    } catch (err) {
      setStatus('❌ Connection Failed');
      setError({
        message: err.message,
        url: apiUrl,
        details: 'Make sure the backend is deployed and CORS is configured'
      });
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔗 Backend Connection Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> <span style={{ 
          color: status.includes('✅') ? 'green' : status.includes('❌') ? 'red' : 'orange' 
        }}>
          {status}
        </span>
      </div>

      {backendInfo && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Backend URL:</strong> {backendInfo.url}<br/>
          <strong>Response Status:</strong> {backendInfo.status}<br/>
          <strong>Message:</strong> {backendInfo.message}
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          <strong>Error Details:</strong><br/>
          <div>URL: {error.url}</div>
          <div>Message: {error.message}</div>
          <div>Help: {error.details}</div>
        </div>
      )}

      <button 
        onClick={testApiConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Test Again
      </button>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Environment:</strong> {process.env.REACT_APP_ENV || 'development'}<br/>
        <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
      </div>
    </div>
  );
};

export default ApiTest;