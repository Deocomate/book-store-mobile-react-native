import api from './api';

const orderService = {
    // POST /order
    createOrder: async (orderData) => {
        // orderData: { profileId, paymentMethod, note, orderProducts: [{productId, quantity}] }
        try {
            const response = await api.post('/order/', orderData);
            return response; // ApiResponse<OrderResponse>
        } catch (error) {
            console.error('Create order failed:', error.message || error);
            throw error;
        }
    },

    // GET /order (Admin/Staff only)
    getAllOrdersForAdmin: async (pageIndex = 1, pageSize = 10, createdAt, paymentStatus, paymentMethod) => {
        const params = {
            pageIndex: pageIndex > 0 ? pageIndex : 1, // Example uses 1-based
            pageSize,
        };
        if (createdAt) params.createdAt = createdAt; // Format: dd-MM-yyyy
        if (paymentStatus !== undefined) params.paymentStatus = paymentStatus;
        if (paymentMethod !== undefined) params.paymentMethod = paymentMethod;

        try {
            const response = await api.get('/order', { params });
            return response; // ApiResponse<PageResponse<OrderResponse>>
        } catch (error) {
            console.error('Admin: Get all orders failed:', error.message || error);
            throw error;
        }
    },

    // GET /order/{orderId} (Admin/Staff only)
    getOrderByIdForAdmin: async (orderId) => {
        try {
            const response = await api.get(`/order/${orderId}`);
            return response; // ApiResponse<OrderResponse>
        } catch (error) {
            console.error(`Admin: Get order ${orderId} failed:`, error.message || error);
            throw error;
        }
    },

    // GET /order/my-orders (User)
    getMyOrders: async (pageIndex = 1, pageSize = 10) => {
        try {
            const response = await api.get('/order/my-orders', {
                // Backend OrderService uses 0-based pageIndex for PageRequest.of
                params: { pageIndex: pageIndex > 0 ? pageIndex : 1, pageSize } // Assuming API expects 1-based
            });
            return response; // ApiResponse<PageResponse<OrderResponse>>
        } catch (error) {
            console.error('Get my orders failed:', error.message || error);
            throw error;
        }
    },

    // GET /order/my-orders/{orderId} (User)
    getMyOrderById: async (orderId) => {
        try {
            const response = await api.get(`/order/my-orders/${orderId}`);
            return response; // ApiResponse<OrderResponse>
        } catch (error) {
            console.error(`Get my order ${orderId} failed:`, error.message || error);
            throw error;
        }
    },

    // POST /order/{orderId}/cancer (User) - Note: backend has 'cancer' typo
    cancelOrder: async (orderId, cancelData) => { // cancelData: { note }
        try {
            const response = await api.post(`/order/${orderId}/cancer`, cancelData);
            return response; // ApiResponse<String>
        } catch (error) {
            console.error(`Cancel order ${orderId} failed:`, error.message || error);
            throw error;
        }
    },

    // PATCH /order/{orderId} (Admin/Staff only)
    updateOrderStatusAsAdmin: async (orderId, statusData) => { // statusData: { status }
        try {
            const response = await api.patch(`/order/${orderId}`, statusData);
            return response; // ApiResponse<OrderResponse>
        } catch (error) {
            console.error(`Admin: Update order status for ${orderId} failed:`, error.message || error);
            throw error;
        }
    },
};
export default orderService;