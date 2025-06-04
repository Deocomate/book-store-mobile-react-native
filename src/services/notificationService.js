// src/services/notificationService.js
import api from './api'; // Giả sử bạn có file api.js cấu hình axios

const notificationService = {
    // Đăng ký FCM token của thiết bị lên server
    // Backend FcmTokenController.fcmTokenResponse nhận POST /fcm-token với body: { token: "your_fcm_token" }
    registerFcmToken: async (fcmToken) => {
        try {
            // Endpoint này trỏ đến notification-service thông qua API Gateway
            // API Gateway: /api/v1/notification/fcm-token -> notification-service/fcm-token
            const response = await api.post('/notification/fcm-token', {token: fcmToken});
            return response; // Backend trả về ApiResponse<FcmTokenResponse>
        } catch (error) {
            console.error('Failed to register FCM token:', error.message || error);
            throw error;
        }
    },

    // Lấy danh sách thông báo của người dùng (đã có sẵn)
    getMyNotifications: async (pageIndex = 1, pageSize = 10) => {
        try {
            const response = await api.get('/notification/my-notification', { // Đã sửa path dựa trên backend controller
                params: {pageIndex, pageSize}
            });
            return response; // Expects ApiResponse<PageResponse<NotificationLog-like structure>>
        } catch (error) {
            console.error('Get my notifications failed:', error.message || error);
            throw error;
        }
    },

    // Đánh dấu thông báo đã đọc (đã có sẵn)
    markNotificationAsRead: async (notificationLogId) => {
        try {
            // API này cần được tạo ở backend nếu chưa có
            // Ví dụ: PATCH /notification/my-notification/{notificationLogId}/read
            const response = await api.patch(`/notification/my-notification/${notificationLogId}/read`);
            return response;
        } catch (error) {
            console.error(`Mark notification ${notificationLogId} as read failed:`, error.message || error);
            throw error;
        }
    },

    // Đánh dấu tất cả đã đọc (đã có sẵn)
    markAllNotificationsAsRead: async () => {
        try {
            // API này cần được tạo ở backend nếu chưa có
            // Ví dụ: POST /notification/my-notification/mark-all-read
            const response = await api.post(`/notification/my-notification/mark-all-read`);
            return response;
        } catch (error) {
            console.error(`Mark all notifications as read failed:`, error.message || error);
            throw error;
        }
    },

    // Xóa một thông báo (đã có sẵn)
    deleteNotification: async (notificationLogId) => {
        try {
            // Backend NotificationFirebaseController đã có @DeleteMapping("/{id}")
            // API Gateway: /api/v1/notification/{id}
            const response = await api.delete(`/notification/${notificationLogId}`);
            return response;
        } catch (error) {
            console.error(`Delete notification ${notificationLogId} failed:`, error.message || error);
            throw error;
        }
    },

    // Xóa tất cả thông báo (đã có sẵn)
    deleteAllNotifications: async () => {
        try {
            // API này cần được tạo ở backend nếu chưa có
            // Ví dụ: DELETE /notification/my-notification/all
            const response = await api.delete(`/notification/my-notification/all`);
            return response;
        } catch (error) {
            console.error(`Delete all notifications failed:`, error.message || error);
            throw error;
        }
    }
};

export default notificationService;