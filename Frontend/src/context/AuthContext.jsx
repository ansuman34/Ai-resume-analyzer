import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider, firebaseInitError } from '../config/firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token by fetching profile
      authAPI.getProfile()
        .then((response) => {
          setUser(response.user);
        })
        .catch((err) => {
          console.error('Token validation failed:', err);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.login({ email, password });

      // Store token in localStorage
      localStorage.setItem('token', response.token);

      // Set user data
      setUser(response.user);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.register(userData);

      // Store token in localStorage
      localStorage.setItem('token', response.token);

      // Set user data
      setUser(response.user);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!auth || !googleProvider) {
        throw new Error(
          firebaseInitError
            ? `Firebase setup incomplete: ${firebaseInitError}`
            : 'Firebase is not configured. Please check your environment variables.'
        );
      }

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const nameParts = (firebaseUser.displayName || 'User').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'User',
        firstName,
        lastName,
        photoURL: firebaseUser.photoURL || '',
        providerId: firebaseUser.uid,
      };

      const response = await authAPI.googleAuth(payload);

      localStorage.setItem('token', response.token);
      setUser(response.user);

      return response;
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const githubLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!auth || !githubProvider) {
        throw new Error(
          firebaseInitError
            ? `Firebase setup incomplete: ${firebaseInitError}`
            : 'Firebase is not configured. Please check your environment variables.'
        );
      }

      const result = await signInWithPopup(auth, githubProvider);
      const firebaseUser = result.user;

      const nameParts = (firebaseUser.displayName || 'User').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'User',
        firstName,
        lastName,
        photoURL: firebaseUser.photoURL || '',
        providerId: firebaseUser.uid,
      };

      const response = await authAPI.githubAuth(payload);

      localStorage.setItem('token', response.token);
      setUser(response.user);

      return response;
    } catch (err) {
      console.error('GitHub login error:', err);
      setError(err.message || 'GitHub sign-in failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    googleLogin,
    githubLogin,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

