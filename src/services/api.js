// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

const API_BASE_URL = 'http://172.20.64.1:8888/api/v1'; // Đảm bảo IP này đúng và có thể truy cập từ thiết bị/emulator

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        // Không set 'Content-Type': 'application/json' mặc định ở đây
        // nếu bạn thường xuyên gửi FormData. Axios sẽ tự xử lý.
        // Hoặc chỉ set nếu không phải FormData.
    },
    timeout: 20000, // Tăng timeout cho upload file
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Để Axios tự động set Content-Type và boundary cho FormData
    if (config.data instanceof FormData) {
        // KHÔNG set config.headers['Content-Type'] ở đây.
        // console.log('Request with FormData, Axios will set Content-Type.');
    } else if (!config.headers['Content-Type']) {
        // Nếu không phải FormData và chưa có Content-Type, có thể đặt mặc định là json
        config.headers['Content-Type'] = 'application/json';
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor giữ nguyên
api.interceptors.response.use((response) => {
    return response.data;
}, async (error) => {
    const originalRequest = error.config;

    if (error.response) {
        const { status, data } = error.response;
        console.error('API Error:', status, data ? JSON.stringify(data) : error.message, 'for URL:', originalRequest.url);


        if (status === 401 && originalRequest.url !== '/identity/auth/login' && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('Token expired or invalid, attempting logout and redirect...');

            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'currentUser']);
            // Sử dụng router.replace để không thêm vào lịch sử điều hướng
            router.replace('/(auth)/login');
            // Trả về một lỗi cụ thể hơn để component có thể bắt và hiển thị thông báo
            return Promise.reject({ message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", status: 401, data: data });
        }
        // Trả về object lỗi chứa thông tin từ backend nếu có
        return Promise.reject(data || { message: error.message || 'An unknown error occurred', status: status });
    } else if (error.request) {
        console.error('Network Error (no response received):', error.request, 'for URL:', originalRequest.url);
        return Promise.reject({ message: 'Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.', status: -1 }); // -1 for network error
    } else {
        console.error('Error setting up request:', error.message, 'for URL:', originalRequest.url);
        return Promise.reject({ message: error.message || 'Có lỗi xảy ra khi gửi yêu cầu.', status: -2 }); // -2 for setup error
    }
});

export default api;