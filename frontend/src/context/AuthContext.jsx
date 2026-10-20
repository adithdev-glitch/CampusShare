import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Set up global axios authorization header helper
  const getAuthHeader = (customToken) => ({
    headers: { Authorization: `Bearer ${customToken || token || localStorage.getItem('token')}` }
  });

  // Sync session on mount
  useEffect(() => {
    const initSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.data.success) {
            setUser(res.data.user);
            fetchNotifications(storedToken);
          }
        } catch (error) {
          console.error('Session sync failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };
    initSession();
  }, []);

  // Fetch notifications
  const fetchNotifications = async (customToken) => {
    try {
      const activeToken = customToken || token || localStorage.getItem('token');
      if (!activeToken) return;

      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter(n => !n.read).length;
        setUnreadNotificationsCount(unread);
      }
    } catch (err) {
      console.error('Fetch notifications failed:', err.message);
    }
  };

  // Trigger notification fetches periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000); // every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        fetchNotifications(userToken);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
        requiresVerification: error.response?.status === 403 && error.response?.data?.requiresVerification,
        email: error.response?.data?.email
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      if (res.data.success) {
        return { success: true, message: res.data.message, email: res.data.email };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const verifyOTP = async (email, code) => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, code });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        fetchNotifications(userToken);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed.'
      };
    }
  };

  const resendOTP = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/auth/resend-otp`, { email });
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Resending OTP failed.'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadNotificationsCount(0);
    localStorage.removeItem('token');
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, getAuthHeader());
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error.message);
    }
  };

  const toggleWishlist = async (resourceId) => {
    try {
      const res = await axios.post(`${API_URL}/resources/${resourceId}/wishlist`, {}, getAuthHeader());
      if (res.data.success) {
        await refreshUser();
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error updating wishlist' };
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/notifications/${id}/read`, {}, getAuthHeader());
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Mark notification read failed:', err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await axios.put(`${API_URL}/notifications/read-all`, {}, getAuthHeader());
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Mark all notifications read failed:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notifications,
        unreadNotificationsCount,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        refreshUser,
        toggleWishlist,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
