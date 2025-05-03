import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = () => {
      // Clear all auth tokens
      auth.logout();
      // Redirect to login page
      navigate('/login/instructor');
    };

    performLogout();
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default Logout;
