import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data and tokens
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('access_token');
    const roleData = localStorage.getItem('role_data');
    
    if (storedUser && accessToken && roleData) {
      const userData = JSON.parse(storedUser);
      const roleInfo = JSON.parse(roleData);
      
      // Ensure role is set correctly
      userData.role = roleInfo.role;
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      const response = await auth.login(userData);
      
      // Store tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Store user data with role
      const userWithRole = {
        ...response.user,
        role: userData.role || response.role_data?.role || 'student'
      };
      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('role_data', JSON.stringify({ role: userWithRole.role }));
      
      setUser(userWithRole);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role_data');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 