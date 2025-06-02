import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = async (params = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications(params);
      setNotifications(response.content || []);
      return response;
    } catch (error) {
      setError('Failed to fetch notifications');
      console.error('Fetch notifications error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  // Fetch notifications and unread count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const markAsRead = async (notificationId) => {
    try {
      setIsLoading(true);
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      setError('Failed to mark notification as read');
      console.error('Mark as read error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      return true;
    } catch (error) {
      setError('Failed to mark all notifications as read');
      console.error('Mark all as read error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setIsLoading(true);
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (error) {
      setError('Failed to delete notification');
      console.error('Delete notification error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      setIsLoading(true);
      await notificationService.deleteAllNotifications();
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      return true;
    } catch (error) {
      setError('Failed to delete all notifications');
      console.error('Delete all notifications error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 