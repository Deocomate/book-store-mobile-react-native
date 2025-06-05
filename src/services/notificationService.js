/* ===== notificationService.js ===== */
// src/services/notificationService.js
import api from './api';

const notificationService = {
    getMyNotifications: async (pageIndex = 1, pageSize = 10) => {
        try {
            const response = await api.get('/notification/my-notification', {
                params: {pageIndex, pageSize}
            });
            return response;
        } catch (error) {
            console.error('Get my notifications failed:', error.message || error);
            throw error;
        }
    },

    deleteNotification: async (id) => { // Parameter changed from notificationLogId to id
        try {
            const response = await api.delete(`/notification/my-notification/${id}`);
            return response;
        } catch (error) {
            console.error(`Delete notification ${id} failed:`, error.message || error);
            throw error;
        }
    },

    deleteAllNotifications: async () => {
        try {
            const response = await api.delete(`/notification/my-notification`);
            return response;
        } catch (error) {
            console.error(`Delete all notifications failed:`, error.message || error);
            throw error;
        }
    },

    markNotificationAsRead: async (id) => { // Parameter changed from notificationLogId to id
        try {
            const response = await api.patch(`/notification/my-notification/mark-as-read/${id}`);
            return response;
        } catch (error) {
            console.error(`Mark notification ${id} as read failed:`, error.message || error);
            throw error;
        }
    },

    markAllNotificationsAsRead: async () => {
        try {
            const response = await api.patch(`/notification/my-notification/mark-all-as-read`);
            return response;
        } catch (error) {
            console.error(`Mark all notifications as read failed:`, error.message || error);
            throw error;
        }
    }
};

export default notificationService;