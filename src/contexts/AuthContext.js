// src/contexts/AuthContext.js
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { identityService, profileService } from '../services'; // Sử dụng identityService và profileService
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const segments = useSegments();

    const attemptLoadUser = useCallback(async () => {
        console.log('Attempting to load user...');
        try {
            setIsLoading(true);
            const token = await identityService.getAuthToken();
            if (token) {
                console.log('Token found, fetching user info...');
                // Token tồn tại, thử lấy thông tin người dùng
                // getMyInfo sẽ tự động xử lý việc token hợp lệ hay không thông qua interceptor của api.js
                const userInfoResponse = await profileService.getMyInfo();
                if (userInfoResponse && userInfoResponse.result) {
                    console.log('User info fetched successfully:', userInfoResponse.result);
                    setUser(userInfoResponse.result);
                    setIsAuthenticated(true);
                } else {
                    // Trường hợp này ít xảy ra nếu getMyInfo() ném lỗi khi token không hợp lệ
                    // nhưng để phòng trường hợp API trả về thành công mà không có result
                    console.log('getMyInfo successful but no user data, logging out.');
                    await identityService.logout(); // Xóa token không hợp lệ
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                console.log('No token found.');
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            // Lỗi có thể xảy ra nếu getMyInfo() ném lỗi (ví dụ 401 và interceptor không xử lý được refresh)
            console.error('Error loading user or invalid token:', error.message || error);
            // identityService.logout() đã được gọi trong interceptor của api.js nếu có lỗi 401
            // Chỉ cần đảm bảo trạng thái được cập nhật đúng
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
            console.log('Finished loading user. isLoading:', false, 'isAuthenticated:', isAuthenticated);
        }
    }, []); // Thêm isAuthenticated vào dependency array nếu bạn muốn nó re-run khi isAuthenticated thay đổi từ bên ngoài

    useEffect(() => {
        attemptLoadUser();
    }, [attemptLoadUser]); // Chỉ chạy một lần khi component mount

    useEffect(() => {
        if (isLoading) {
            console.log('Auth state loading, skipping route protection.');
            return;
        }
        console.log('Auth state loaded. isAuthenticated:', isAuthenticated, 'Current segments:', segments);

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            console.log('Not authenticated and not in auth group, redirecting to login.');
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            console.log('Authenticated and in auth group, redirecting to home.');
            router.replace('/(app)/(home)/'); // Điều hướng đến màn hình chính trong (app) group
        } else {
            console.log('Routing condition not met or already in correct group.');
        }
    }, [isAuthenticated, segments, isLoading, router]);

    const login = async (username, password) => {
        try {
            setIsLoading(true);
            const loginResponse = await identityService.login({ username, password });
            // loginResponse là ApiResponse<AuthenticationResponse>
            if (loginResponse && loginResponse.result && loginResponse.result.token) {
                // Token đã được lưu trong identityService.login
                console.log('Login successful, fetching user info...');
                const userInfoResponse = await profileService.getMyInfo();
                if (userInfoResponse && userInfoResponse.result) {
                    setUser(userInfoResponse.result);
                    setIsAuthenticated(true);
                    console.log('User set in context:', userInfoResponse.result);
                    return loginResponse; // Trả về response gốc của login
                } else {
                    throw new Error("Failed to fetch user information after login.");
                }
            } else {
                // Xử lý trường hợp login API thành công nhưng không trả về token
                throw new Error(loginResponse.message || "Login failed, no token received.");
            }
        } catch (error) {
            console.error('Login error in AuthProvider:', error.message || error);
            setUser(null);
            setIsAuthenticated(false);
            throw error; // Ném lỗi để màn hình Login có thể xử lý
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => { // { username, password, email }
        try {
            setIsLoading(true);
            const response = await identityService.register(userData);
            // Sau khi đăng ký thành công, backend có thể không tự động login user
            // User sẽ cần đăng nhập sau khi đăng ký
            return response; // ApiResponse<UserResponse> (result có thể null)
        } catch (error) {
            console.error('Register error in AuthProvider:', error.message || error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await identityService.logout(); // Xử lý cả API call và AsyncStorage
            setUser(null);
            setIsAuthenticated(false);
            router.replace('/(auth)/login');
            console.log('User logged out and redirected to login.');
        } catch (error) {
            // Lỗi ở đây thường là lỗi mạng khi gọi API logout, AsyncStorage vẫn sẽ được xóa
            console.error('Logout error in AuthProvider:', error.message || error);
            // Đảm bảo trạng thái local được reset ngay cả khi API logout thất bại
            setUser(null);
            setIsAuthenticated(false);
            router.replace('/(auth)/login');
        } finally {
            setIsLoading(false);
        }
    };

    const sendOtpForgotPassword = async (username) => {
        try {
            return await identityService.sendOtpForgotPassword(username);
        } catch (error) {
            console.error('Forgot password (send OTP) error in AuthProvider:', error.message || error);
            throw error;
        }
    };

    const verifyOtpAndGetResetToken = async (username, otp) => {
        try {
            const response = await identityService.verifyOtpForgotPassword(username, otp);
            // response.result.verificationToken
            return response; // Trả về toàn bộ ApiResponse để màn hình có thể lấy token
        } catch (error) {
            console.error('Verify OTP error in AuthProvider:', error.message || error);
            throw error;
        }
    };


    const resetPasswordWithVerificationToken = async (newPassword, verificationToken) => {
        try {
            return await identityService.resetPasswordWithToken(newPassword, verificationToken);
        } catch (error) {
            console.error('Reset password error in AuthProvider:', error.message || error);
            throw error;
        }
    };

    // Cập nhật email
    const updateMyEmail = async (email) => {
        try {
            setIsLoading(true);
            const response = await profileService.updateMyInfo({ email }); // identityService.updateMyInfo mong muốn { email }
            if (response && response.result) {
                setUser(prevUser => ({ ...prevUser, ...response.result })); // Cập nhật user state với thông tin mới
                await identityService.setCurrentUser(response.result); // Cập nhật AsyncStorage
            }
            return response;
        } catch (error) {
            console.error('Update email error in AuthProvider:', error.message || error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Cập nhật mật khẩu
    const updateMyPassword = async (oldPassword, newPassword) => {
        if (!user || !user.id) {
            console.error("User ID not available for password update.");
            throw new Error("User not authenticated or ID missing.");
        }
        try {
            return await identityService.updateMyPassword(user.id, { oldPassword, newPassword });
        } catch (error) {
            console.error('Update password error in AuthProvider:', error.message || error);
            throw error;
        }
    };

    // Cập nhật ảnh đại diện
    const updateMyProfileImage = async (profileImageFile) => {
        try {
            setIsLoading(true);
            const response = await identityService.updateMyProfileImage(profileImageFile);
            if (response && response.result && response.result.profileImage) {
                setUser(prevUser => ({
                    ...prevUser, profileImage: response.result.profileImage // Giả sử API trả về URL ảnh mới trong result.profileImage
                }));
                // identityService.updateMyProfileImage đã cập nhật AsyncStorage
            }
            return response;
        } catch (error) {
            console.error('Update profile image error in AuthProvider:', error.message || error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        sendOtpForgotPassword,
        verifyOtpAndGetResetToken,
        resetPasswordWithVerificationToken,
        updateMyEmail,
        updateMyPassword,
        updateMyProfileImage, // Các hàm khác liên quan đến profile chi tiết (tên, địa chỉ) sẽ gọi profileService
        // và có thể không cần thiết phải nằm trong AuthContext nếu chúng không ảnh hưởng trực tiếp đến trạng thái auth.
    };

    return (<AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>);
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
