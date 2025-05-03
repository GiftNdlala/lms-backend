import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const LoginForm = ({ role, title, icon, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        role: role
      });
    } catch (err) {
      setError(err.message);
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

        <h2>
          <i className={`fas ${icon} icon`}></i> {title}
        </h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="button primary-button w-full"
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

export default LoginForm; 