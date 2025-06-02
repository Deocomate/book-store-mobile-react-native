/*
####################################################################
# api.js (EXISTING - PROVIDED FOR CONTEXT - NO CHANGES NEEDED HERE)
####################################################################
*/
// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; // Để điều hướng khi token hết hạn

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL, headers: {
        'Content-Type': 'application/json',
    }, timeout: 15000, // Timeout sau 15 giây
});

// Request interceptor để đính kèm token
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Đối với request upload file, cần set Content-Type là multipart/form-data
    if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor để xử lý lỗi chung
api.interceptors.response.use((response) => {
    return response.data; // Trả về ApiResponse từ backend
}, async (error) => {
    const originalRequest = error.config;

    if (error.response) {
        const { status, data } = error.response;
        console.error('API Error:', status, data ? JSON.stringify(data) : error.message);

        if (status === 401 && originalRequest.url !== '/identity/auth/login' && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('Token expired or invalid, attempting to refresh or redirecting...');

            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'currentUser']);
            if (router.canGoBack()) {
                router.replace('/(auth)/login');
            } else {
                router.push('/(auth)/login');
            }
            return Promise.reject(new Error(data?.message || "Session expired. Please login again."));
        }
        return Promise.reject(data || new Error(error.message || 'An unknown error occurred'));
    } else if (error.request) {
        console.error('Network Error:', error.request);
        return Promise.reject(new Error('Network error. Please check your connection and try again.'));
    } else {
        console.error('Error setting up request:', error.message);
        return Promise.reject(error);
    }
});

export default api;