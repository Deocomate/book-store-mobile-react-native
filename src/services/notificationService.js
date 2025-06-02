

/*
####################################################################
# notificationService.js
####################################################################
*/
// src/services/notificationService.js
import api from './api';

const notificationService = {
    // POST /notification/fcm-token
    registerFcmToken: async (fcmToken) => { // fcmToken (string)
        try {
            const response = await api.post('/notification/fcm-token', { token: fcmToken });
            return response; // ApiResponse<FcmTokenResponse>
        } catch (error) {
            console.error('Register FCM token failed:', error.message || error);
            throw error;
        }
    },

    // Example: Get user's notifications (assuming endpoint exists)
    getMyNotifications: async (pageIndex = 1, pageSize = 10) => {
        try {
            // This endpoint is an assumption. Replace with actual if available.
            const response = await api.get('/notification/my-notifications', {
                params: { pageIndex, pageSize }
            });
            return response; // Example: ApiResponse<PageResponse<NotificationItem>>
        } catch (error) {
            console.error('Get my notifications failed:', error.message || error);
            // Return a default structure or throw
            return { status: error.status || 500, message: error.message || "Failed to fetch notifications", result: { content: [], totalPages: 0, totalElements: 0 }, timestamp: new Date().toISOString() };

        }
    },

    // Example: Mark notification as read (assuming endpoint exists)
    markNotificationAsRead: async (notificationId) => {
        try {
            // This endpoint is an assumption.
            const response = await api.patch(`/notification/${notificationId}/read`);
            return response;
        } catch (error) {
            console.error(`Mark notification ${notificationId} as read failed:`, error.message || error);
            throw error;
        }
    },

    // Example: Mark all as read (assuming endpoint exists)
    markAllNotificationsAsRead: async () => {
        try {
            // This endpoint is an assumption.
            const response = await api.post(`/notification/mark-all-read`);
            return response;
        } catch (error) {
            console.error(`Mark all notifications as read failed:`, error.message || error);
            throw error;
        }
    },
    // Example: Delete a notification (assuming endpoint exists)
    deleteNotification: async (notificationId) => {
        try {
            const response = await api.delete(`/notification/${notificationId}`);
            return response;
        } catch (error) {
            console.error(`Delete notification ${notificationId} failed:`, error.message || error);
            throw error;
        }
    },

    // Example: Delete all notifications (assuming endpoint exists)
    deleteAllNotifications: async () => {
        try {
            const response = await api.delete(`/notification/all`);
            return response;
        } catch (error) {
            console.error(`Delete all notifications failed:`, error.message || error);
            throw error;
        }
    }
};
export default notificationService;