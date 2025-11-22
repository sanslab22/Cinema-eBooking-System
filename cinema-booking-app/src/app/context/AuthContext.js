// src/contexts/AuthContext.js
'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Example: Check for stored token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      // Validate token and set user/isAuthenticated
      // For a real app, you'd likely make an API call to validate the token
      setUser({ username: 'exampleUser' }); // Placeholder
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials) => {
    // Implement actual login logic (API call to your backend)
    // On successful login:
    const token = 'bdm2PLpHfy+Vc1dV/+WVb6A9c7bGfjZ+WJxTyN8m4Yc='; // Replace with actual token from backend
    localStorage.setItem('authToken', token);
    setUser({ username: credentials.username }); // Set user data
    setIsAuthenticated(true);
    return true; // Indicate success
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};