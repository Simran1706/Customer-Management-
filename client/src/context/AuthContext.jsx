import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize authentication state on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('crm_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
          localStorage.setItem('crm_user', JSON.stringify(response.data.data));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  /**
   * Log in user with credentials and optional role verification
   */
  const login = async (email, password, expectedRole = null) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        expectedRole
      });

      const { token: receivedToken, user: receivedUser } = response.data.data;

      localStorage.setItem('crm_token', receivedToken);
      localStorage.setItem('crm_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, data: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  /**
   * Register a new customer
   */
  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      const { token: receivedToken, user: receivedUser } = response.data.data;

      localStorage.setItem('crm_token', receivedToken);
      localStorage.setItem('crm_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return {
        success: true,
        message: response.data.message || 'Registration successful!',
        data: receivedUser
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please check form values.';
      return { success: false, message };
    }
  };

  /**
   * Log out currently authenticated user
   */
  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setToken(null);
    setUser(null);
  };

  /**
   * Update active user in state
   */
  const updateUser = (updatedData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedData };
      localStorage.setItem('crm_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
