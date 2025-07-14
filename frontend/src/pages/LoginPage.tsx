// AuthUtils.ts - Simple authentication utilities
export const AuthUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem("isAuthenticated") === "true";
  },

  // Get current username
  getUsername: (): string | null => {
    return localStorage.getItem("username");
  },

  // Login user
  login: (username: string): void => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("username", username);
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
  },

  // Check credentials
  validateCredentials: (username: string, password: string): boolean => {
    return username === "admin" && password === "admin";
  }
};

// ProtectedRoute.tsx - Component to protect routes
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthUtils } from './AuthUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!AuthUtils.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  // Show loading or redirect logic
  if (!AuthUtils.isAuthenticated()) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};