// src/contexts/NotificationContext.js
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {notificationService} from '../services';
import {useAuth} from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({children}) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const {isAuthenticated, user} = useAuth();

    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 15;

    const fetchNotifications = useCallback(async (page = 1, isRefreshing = false) => {
        if (!isAuthenticated || !user) {
            setNotifications([]);
            setUnreadCount(0);
            setPageIndex(1);
            setTotalPages(1);
            setIsLoading(false);
            setLoadingMore(false);
            return;
        }
        if (loadingMore && !isRefreshing) return;

        if (page === 1) setIsLoading(true); else if (!isRefreshing) setLoadingMore(true);
        setError(null);

        try {
            const response = await notificationService.getMyNotifications(page, pageSize);

            console.log(response)

            if (response && response.status === 200 && response.result) {
                const newNotifications = response.result.data || [];
                if (isRefreshing || page === 1) {
                    setNotifications(newNotifications);
                } else {
                    setNotifications(prev => [...prev, ...newNotifications]);
                }
                setTotalPages(response.result.totalPages || 1);
                setPageIndex(page);
            } else {
                throw new Error(response?.message || "Không thể tải thông báo.");
            }
        } catch (err) {
            console.error('Fetch notifications error:', err);
            setError(err.message);
            if (page === 1) setNotifications([]);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
            // UI component (NotificationScreen) sẽ quản lý trạng thái refreshing của chính nó.
        }
    }, [isAuthenticated, user, pageSize, loadingMore]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications(1, true); // Initial fetch or fetch on auth change
        } else {
            // Clear data if user logs out or is not authenticated
            setNotifications([]);
            setUnreadCount(0);
            setPageIndex(1);
            setTotalPages(1);
        }
    }, [isAuthenticated, fetchNotifications]); // fetchNotifications is stable due to useCallback

    useEffect(() => {
        if (isAuthenticated) {
            const currentUnread = notifications.filter(n => n.status !== 'READ' && n.status !== 'FAILED').length;
            setUnreadCount(currentUnread);
        }
    }, [notifications, isAuthenticated]);

    const markAsRead = async (notificationLogId) => {
        if (!isAuthenticated) return false;
        setError(null);
        try {
            const response = await notificationService.markNotificationAsRead(notificationLogId);
            if (response && response.status === 200) {
                setNotifications(prev => prev.map(n => n.notification_log_id === notificationLogId ? {
                    ...n, status: 'READ'
                } : n));
                return true;
            } else {
                throw new Error(response?.message || "Không thể đánh dấu đã đọc.");
            }
        } catch (err) {
            console.error('Mark as read error:', err);
            setError(err.message);
            return false;
        }
    };

    const markAllAsRead = async () => {
        if (!isAuthenticated) return false;
        setError(null);
        try {
            const response = await notificationService.markAllNotificationsAsRead();
            if (response && response.status === 200) {
                setNotifications(prev => prev.map(n => ({...n, status: 'READ'})));
                return true;
            } else {
                throw new Error(response?.message || "Không thể đánh dấu tất cả đã đọc.");
            }
        } catch (err) {
            console.error('Mark all as read error:', err);
            setError(err.message);
            return false;
        }
    };

    const deleteNotificationById = async (notificationLogId) => {
        if (!isAuthenticated) return false;
        setError(null);
        try {
            const response = await notificationService.deleteNotification(notificationLogId);
            if (response && response.status === 200) {
                setNotifications(prev => prev.filter(n => n.notification_log_id !== notificationLogId));
                return true;
            } else {
                throw new Error(response?.message || "Không thể xóa thông báo.");
            }
        } catch (err) {
            console.error('Delete notification error:', err);
            setError(err.message);
            return false;
        }
    };

    const deleteAllNotifications = async () => {
        if (!isAuthenticated || notifications.length === 0) return false;
        setError(null);
        setIsLoading(true);
        try {
            const response = await notificationService.deleteAllNotifications();
            if (response && response.status === 200) {
                setNotifications([]);
                setUnreadCount(0);
                setPageIndex(1);
                setTotalPages(1);
                return true;
            } else {
                throw new Error(response?.message || "Không thể xóa tất cả thông báo.");
            }
        } catch (err) {
            console.error('Delete all notifications error:', err);
            setError(err.message || 'Lỗi xóa tất cả thông báo.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const registerDeviceToken = async (deviceToken, deviceType = 'MOBILE') => {
        if (!isAuthenticated || !user) return false;
        try {
            const response = await notificationService.registerFcmToken(deviceToken);
            if (response && response.status === 201) {
                console.log('FCM token registered successfully:', response.result);
                return true;
            }
            console.warn('FCM token registration did not return expected success:', response);
            return false;
        } catch (err) {
            console.error('Register FCM token error:', err);
            return false;
        }
    };

    const value = {
        notifications,
        unreadCount,
        isLoading,
        loadingMore,
        error,
        pageIndex,
        totalPages,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotificationById,
        deleteAllNotifications,
        registerDeviceToken,
    };

    return (<NotificationContext.Provider value={value}>
        {children}
    </NotificationContext.Provider>);
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export default NotificationContext;