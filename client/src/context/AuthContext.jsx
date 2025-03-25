import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { PROTECTED_ROUTES } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // Check if we have a user stored in localStorage
      const storedUser = localStorage.getItem('medconnect_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/login', { username, password });
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem('medconnect_user', JSON.stringify(userData));
      setIsLoading(false);
      return userData;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medconnect_user');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && PROTECTED_ROUTES.some(route => location.startsWith(route))) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
};