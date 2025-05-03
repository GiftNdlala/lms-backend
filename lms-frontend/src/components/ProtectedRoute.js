import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Get the current path to determine which login page to redirect to
    const currentPath = location.pathname;
    const isInstructorPath = currentPath.includes('/dashboard/instructor');
    const loginPath = isInstructorPath ? '/login/instructor' : '/login/student';
    
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 