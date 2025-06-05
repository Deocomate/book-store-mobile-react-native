/* ===== NotificationContext.js ===== */
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

    useEffect(() => {
        const newUnreadCount = notifications.filter(n => !n.isRead).length;
        setUnreadCount(newUnreadCount);
    }, [notifications]);

    const fetchNotifications = useCallback(async (page = 1, isRefreshing = false) => {
        if (!isAuthenticated || !user) {
            setNotifications([]);
            setPageIndex(1);
            setTotalPages(1);
            setIsLoading(false);
            setLoadingMore(false);
            return;
        }
        if (loadingMore && !isRefreshing && page > 1) return;

        if (page === 1) setIsLoading(true); else if (!isRefreshing) setLoadingMore(true);
        setError(null);

        try {
            const response = await notificationService.getMyNotifications(page, pageSize);
            if (response && response.status === 200 && response.result) {
                const fetchedData = response.result.data || [];
                // Assuming each notification item in the list has an 'id' and 'status' ('READ'/'UNREAD')
                const newNotifications = fetchedData.map(n => ({
                    ...n, id: n.id, isRead: n.isRead,
                }));

                if (isRefreshing || page === 1) {
                    setNotifications(newNotifications);
                } else {
                    setNotifications(prev => {
                        const existingIds = new Set(prev.map(notif => notif.id)); // Use 'id'
                        const uniqueNewNotifications = newNotifications.filter(notif => !existingIds.has(notif.id));
                        return [...prev, ...uniqueNewNotifications];
                    });
                }
                setTotalPages(response.result.totalPages || 1);
                setPageIndex(page);
            } else {
                throw new Error(response?.message || "Không thể tải thông báo. Phản hồi không hợp lệ từ máy chủ.");
            }
        } catch (err) {
            console.error('Fetch notifications error:', err);
            setError(err.message);
            if (page === 1) setNotifications([]);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }, [isAuthenticated, user, pageSize, loadingMore]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications(1, true);
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setPageIndex(1);
            setTotalPages(1);
            setError(null);
        }
    }, [isAuthenticated, fetchNotifications]);

    const deleteNotificationById = async (id) => { // Parameter changed to id
        if (!isAuthenticated) return false;
        setError(null);
        const originalNotifications = [...notifications];
        setNotifications(prev => prev.filter(n => n.id !== id)); // Use 'id'
        try {
            const response = await notificationService.deleteNotification(id); // Pass 'id'
            if (response && response.status === 200) {
                return true;
            } else {
                setNotifications(originalNotifications);
                throw new Error(response?.message || "Không thể xóa thông báo.");
            }
        } catch (err) {
            console.error('Delete notification error:', err);
            setError(err.message);
            setNotifications(originalNotifications);
            return false;
        }
    };

    const deleteAllNotifications = async () => {
        if (!isAuthenticated || notifications.length === 0) return false;
        setError(null);
        setIsLoading(true);
        const originalNotifications = [...notifications];
        setNotifications([]);
        setUnreadCount(0);
        try {
            const response = await notificationService.deleteAllNotifications();
            if (response && response.status === 200) {
                setPageIndex(1);
                setTotalPages(1);
                return true;
            } else {
                setNotifications(originalNotifications);
                throw new Error(response?.message || "Không thể xóa tất cả thông báo.");
            }
        } catch (err) {
            console.error('Delete all notifications error:', err);
            setError(err.message || 'Lỗi xóa tất cả thông báo.');
            setNotifications(originalNotifications);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id) => { // Parameter changed to id
        if (!isAuthenticated) return false;
        const originalNotifications = [...notifications];
        setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n // Use 'id'
        ));
        try {
            const response = await notificationService.markNotificationAsRead(id); // Pass 'id'
            if (response && response.status === 200 && response.result) {
                setNotifications(prev => prev.map(n => n.id === id // Use 'id'
                    ? {...response.result, isRead: true} // Use the backend's updated object, ensure isRead
                    : n));
                return true;
            } else {
                setNotifications(originalNotifications);
                throw new Error(response?.message || "Không thể đánh dấu đã đọc.");
            }
        } catch (err) {
            console.error('Mark notification as read error:', err);
            setError(err.message);
            setNotifications(originalNotifications);
            return false;
        }
    };

    const markAllAsRead = async () => {
        if (!isAuthenticated || notifications.filter(n => !n.isRead).length === 0) return false;
        setError(null);
        setIsLoading(true);
        const originalNotifications = [...notifications];
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        try {
            const response = await notificationService.markAllNotificationsAsRead();
            console.log(response)
            if (response && response.status === 200) {
                // If API returns list of updated notifications, update state with them
                // For now, assuming optimistic update is sufficient
                return true;
            } else {
                setNotifications(originalNotifications);
                throw new Error(response?.message || "Không thể đánh dấu tất cả đã đọc.");
            }
        } catch (err) {
            console.error('Mark all notifications as read error:', err);
            setError(err.message);
            setNotifications(originalNotifications);
            return false;
        } finally {
            setIsLoading(false);
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
        deleteNotificationById,
        deleteAllNotifications,
        markAsRead,
        markAllAsRead,
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
