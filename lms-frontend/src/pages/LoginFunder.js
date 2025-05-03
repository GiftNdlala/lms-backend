import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import '../styles.css';

const LoginFunder = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'funder'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await auth.login({
        email: formData.email,
        password: formData.password
      });

      if (!response || !response.access || !response.refresh) {
        throw new Error('Invalid login response');
      }

      // Store the tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Store user data
      const userData = {
        ...response.user,
        role: 'funder'
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role_data', JSON.stringify({ role: 'funder' }));
      
      // Redirect to funder dashboard
      navigate('/dashboard/funder');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="container">
    <div className="card">
      <img
        src="/logo.png"
        alt="G.A.S Logo"
        className="h-12 mx-auto mb-4"
      />

        <h2><i className="fas fa-chalkboard-teacher icon"></i> Funder / Investor Login</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
        <div className="mb-4">
            <label htmlFor="email">Email</label>
          <input
            className="input"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
          />
        </div>

        <div className="mb-6">
            <label htmlFor="password">Password</label>
          <input
            className="input"
            id="password"
            type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
          />
        </div>

          <button 
            className="button" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
        </button>

        <button
          className="text-blue-500 hover:text-blue-700 text-sm mt-4 block mx-auto"
          type="button"
            onClick={() => navigate('/forgot-password')}
        >
          Forgot Password?
        </button>
      </form>
    </div>
  </div>
);
};

export default LoginFunder;
