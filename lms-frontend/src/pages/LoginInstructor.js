import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/api';
import '../styles.css';

const LoginInstructor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'instructor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await auth.login({
        email: formData.email,
        password: formData.password,
        role: 'instructor'
      });

      if (!response.access || !response.refresh) {
        throw new Error('Invalid login response');
      }

      // Store tokens and user data
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('role_data', JSON.stringify({ role: 'instructor' }));
      
      // Get the redirect path from location state or default to dashboard
      const from = location.state?.from?.pathname || '/dashboard/instructor';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');
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

        <h2><i className="fas fa-chalkboard-teacher icon"></i> Instructor / Moderator Login</h2>

        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="primary-button"
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

export default LoginInstructor;
