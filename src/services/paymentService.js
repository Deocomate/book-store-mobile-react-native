
/*
####################################################################
# paymentService.js
####################################################################
*/
// src/services/paymentService.js
import api from './api';

const paymentService = {
    // POST /payment/momo/{orderId}
    createMomoPayment: async (orderId) => {
        try {
            const response = await api.post(`/payment/momo/${orderId}`);
            return response; // ApiResponse<MomoResponse>
        } catch (error) {
            console.error(`Create Momo payment for order ${orderId} failed:`, error.message || error);
            throw error;
        }
    },

    // GET /payment/vnpay/{orderId}
    getVNPayPaymentUrl: async (orderId, bankCode = '') => {
        const params = {};
        if (bankCode) {
            params.bankCode = bankCode;
        }
        try {
            // This endpoint returns ApiResponse<Map<String, String>> where map is {"payUrl": "..."}
            const response = await api.get(`/payment/vnpay/${orderId}`, { params });
            return response;
        } catch (error) {
            console.error(`Get VNPay payment URL for order ${orderId} failed:`, error.message || error);
            throw error;
        }
    },
    // Note: /momo_return and /vnpay_return are callback URLs for the backend, not directly called by the mobile app.
};
export default paymentService;