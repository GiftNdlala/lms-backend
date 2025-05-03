import React from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/api';
import LoginForm from '../components/LoginForm';
import '../styles.css';

const LoginStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleLogin = async (credentials) => {
    try {
      console.log('Login attempt with credentials:', { ...credentials, role: 'student' });
      
      const response = await auth.login({
        ...credentials,
        role: 'student'
      });

      console.log('Login response:', response);

      if (!response || !response.access || !response.refresh) {
        throw new Error('Invalid login response');
      }

      // Store the tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Store user data
      const userData = {
        ...response.user,
        role: 'student'
      };
      console.log('Storing user data:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role_data', JSON.stringify({ role: 'student' }));
      
      // Verify stored data
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('role_data');
      console.log('Stored user data:', storedUser);
      console.log('Stored role data:', storedRole);
      
      // Get the redirect path from location state or default to dashboard
      const from = location.state?.from?.pathname || '/dashboard/student';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // Handle specific API error responses
        if (err.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.status === 403) {
          errorMessage = 'Access denied. Please contact support.';
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
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

        {successMessage && (
          <div className="success-message mb-4">
            {successMessage}
          </div>
        )}

        <LoginForm
          role="student"
          title="Student Login"
          icon="fa-user-graduate"
          onSubmit={handleLogin}
        />
      </div>
    </div>
  );
};

export default LoginStudent;
