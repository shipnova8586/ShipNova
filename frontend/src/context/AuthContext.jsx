import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Our MongoDB user data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewClerkUser, setIsNewClerkUser] = useState(false);
  const [pendingClerkData, setPendingClerkData] = useState(null);

  // Clerk hooks
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerkAuth();

  // Set API base URL and timeout (45s for Render cold-starts)
  const envApiUrl = import.meta.env.VITE_API_URL;
  const API_URL = (envApiUrl && !envApiUrl.includes('<') && !envApiUrl.includes('AAPKA'))
    ? envApiUrl
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : 'https://shipnova-backend-nrwn.onrender.com/api');
  axios.defaults.baseURL = API_URL;
  axios.defaults.timeout = 45000;

  // When Clerk user state changes, sync with our backend
  useEffect(() => {
    let isMounted = true;

    const syncWithBackend = async (retryCount = 0) => {
      // Wait for Clerk to finish loading
      if (!clerkLoaded) return;

      // If no Clerk user (logged out), clear our user state
      if (!clerkUser) {
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setLoading(false);
        return;
      }

      // Clerk user is logged in - sync with our backend
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      const name = clerkUser.fullName || clerkUser.username || email;

      try {
        const res = await axios.post('/auth/clerk-sync', {
          clerkUserId: clerkUser.id,
          email,
          name
        });

        if (res.data.success && isMounted) {
          // Existing user found - store JWT and user data
          localStorage.setItem('token', res.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          setUser(res.data.user);
          setIsNewClerkUser(false);
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;

        if (err.response?.status === 404 && err.response?.data?.isNewUser) {
          // New Clerk user - needs to register their company
          setIsNewClerkUser(true);
          setPendingClerkData({
            clerkUserId: clerkUser.id,
            email,
            name
          });
          setUser(null);
          setLoading(false);
        } else if (retryCount < 2 && (!err.response || err.code === 'ECONNABORTED' || err.response?.status >= 500)) {
          // Server cold-starting on Render, retry automatically
          console.warn(`[ShipNova] Backend waking up, retrying sync (attempt ${retryCount + 1})...`);
          setTimeout(() => {
            if (isMounted) syncWithBackend(retryCount + 1);
          }, 3000);
        } else {
          setError(err.response?.data?.message || 'Failed to sync with backend.');
          setLoading(false);
        }
      }
    };

    syncWithBackend();

    return () => {
      isMounted = false;
    };
  }, [clerkUser, clerkLoaded]);

  // Register Company (called from registration form for new Clerk users)
  const registerCompanyWithClerk = async (formData) => {
    setError(null);
    try {
      const payload = {
        ...formData,
        clerkUserId: pendingClerkData?.clerkUserId,
        adminEmail: pendingClerkData?.email,
        adminName: pendingClerkData?.name
      };

      const res = await axios.post('/auth/clerk-register-company', payload);

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        setIsNewClerkUser(false);
        setPendingClerkData(null);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Company registration failed.');
      return false;
    }
  };

  // Keep legacy email/password login for backward compatibility
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout - signs out from Clerk AND clears our state
  const logout = async () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsNewClerkUser(false);
    await signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isNewClerkUser,
        pendingClerkData,
        registerCompanyWithClerk,
        login,
        logout,
        setUser,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
