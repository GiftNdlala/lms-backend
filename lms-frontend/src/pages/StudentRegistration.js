import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentDashboard.css';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    student_id: '',
    program: '',
    batch: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.student_id.match(/^\d{8}$/)) {
      setError('Student ID must be 8 digits');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/accounts/register/student/', {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        student_id: formData.student_id,
        program: formData.program,
        batch: formData.batch
      });

      if (response.data) {
        // Registration successful
        navigate('/login/student', { 
          state: { 
            message: 'Registration successful! Please log in with your new account.' 
          } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2>Student Registration</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="first_name">First Name:</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name:</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              placeholder="Enter your last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="student_id">Student ID:</label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
              placeholder="Enter your 8-digit student ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="program">Program:</label>
            <input
              type="text"
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              placeholder="Enter your program"
            />
          </div>

          <div className="form-group">
            <label htmlFor="batch">Batch Year:</label>
            <input
              type="text"
              id="batch"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              required
              placeholder="Enter your batch year (e.g., 2023)"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p className="login-link">
            Already have an account?{' '}
            <span onClick={() => navigate('/login/student')} className="link">
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration; 