// src/contexts/AuthContext.js
import {useRouter, useSegments} from 'expo-router';
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {identityService, profileService} from '../services'; // [cite: 854]

const AuthContext = createContext(null); // [cite: 855]

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null); // [cite: 855]
    const [isLoading, setIsLoading] = useState(true); // [cite: 856]
    const [isAuthenticated, setIsAuthenticated] = useState(false); // [cite: 856]

    const router = useRouter(); // [cite: 856]
    const segments = useSegments(); // [cite: 856]

    const attemptLoadUser = useCallback(async () => {
        console.log('Attempting to load user...'); // [cite: 857]
        try {
            setIsLoading(true); // [cite: 857]
            const token = await identityService.getAuthToken(); // [cite: 857]
            if (token) {
                console.log('Token found, fetching user info...'); // [cite: 857]
                // Token tồn tại, thử lấy thông tin người dùng
                // getMyInfo sẽ tự động xử lý việc token hợp lệ hay không thông qua interceptor của api.js
                const userInfoResponse = await profileService.getMyInfo(); // [cite: 858]
                if (userInfoResponse && userInfoResponse.result) {
                    console.log('User info fetched successfully:', userInfoResponse.result); // [cite: 859]
                    setUser(userInfoResponse.result); // [cite: 859]
                    setIsAuthenticated(true); // [cite: 859]
                } else {
                    // Trường hợp này ít xảy ra nếu getMyInfo() ném lỗi khi token không hợp lệ
                    // nhưng để phòng trường hợp API trả về thành công mà không có result
                    console.log('getMyInfo successful but no user data, logging out.'); // [cite: 860]
                    await identityService.logout(); // Xóa token không hợp lệ [cite: 861]
                    setUser(null); // [cite: 861]
                    setIsAuthenticated(false); // [cite: 862]
                }
            } else {
                console.log('No token found.'); // [cite: 862]
                setUser(null); // [cite: 863]
                setIsAuthenticated(false); // [cite: 863]
            }
        } catch (error) {
            // Lỗi có thể xảy ra nếu getMyInfo() ném lỗi (ví dụ 401 và interceptor không xử lý được refresh)
            console.error('Error loading user or invalid token:', error.message || error); // [cite: 863]
            // identityService.logout() đã được gọi trong interceptor của api.js nếu có lỗi 401
            // Chỉ cần đảm bảo trạng thái được cập nhật đúng
            setUser(null); // [cite: 864]
            setIsAuthenticated(false); // [cite: 865]
        } finally {
            setIsLoading(false); // [cite: 865]
            console.log('Finished loading user. isLoading:', false, 'isAuthenticated:', isAuthenticated); // [cite: 866]
        }
    }, [isAuthenticated]); // Thêm isAuthenticated vào dependency array nếu bạn muốn nó re-run khi isAuthenticated thay đổi từ bên ngoài [cite: 866, 867]

    useEffect(() => {
        attemptLoadUser(); // [cite: 867]
    }, [attemptLoadUser]); // Chỉ chạy một lần khi component mount [cite: 867, 868]

    useEffect(() => {
        if (isLoading) {
            console.log('Auth state loading, skipping route protection.'); // [cite: 868]
            return;
        }
        console.log('Auth state loaded. isAuthenticated:', isAuthenticated, 'Current segments:', segments); // [cite: 868]

        const inAuthGroup = segments[0] === '(auth)'; // [cite: 868]

        if (!isAuthenticated && !inAuthGroup) {
            console.log('Not authenticated and not in auth group, redirecting to login.'); // [cite: 869]
            router.replace('/(auth)/login'); // [cite: 869]
        } else if (isAuthenticated && inAuthGroup) {
            console.log('Authenticated and in auth group, redirecting to home.'); // [cite: 869]
            router.replace('/(app)/(home)/'); // Điều hướng đến màn hình chính trong (app) group [cite: 869]
        } else {
            console.log('Routing condition not met or already in correct group.'); // [cite: 870]
        }
    }, [isAuthenticated, segments, isLoading, router]); // [cite: 870]

    const login = async (username, password) => {
        try {
            setIsLoading(true); // [cite: 871]
            const loginResponse = await identityService.login({username, password}); // [cite: 872]
            // loginResponse là ApiResponse<AuthenticationResponse>
            if (loginResponse && loginResponse.result && loginResponse.result.token) {
                // Token đã được lưu trong identityService.login
                console.log('Login successful, fetching user info...'); // [cite: 872]
                const userInfoResponse = await profileService.getMyInfo(); // [cite: 873]
                if (userInfoResponse && userInfoResponse.result) {
                    setUser(userInfoResponse.result); // [cite: 873]
                    setIsAuthenticated(true); // [cite: 874]
                    console.log('User set in context:', userInfoResponse.result); // [cite: 874]
                    return loginResponse; // Trả về response gốc của login [cite: 874]
                } else {
                    throw new Error("Failed to fetch user information after login."); // [cite: 874]
                }
            } else {
                // Xử lý trường hợp login API thành công nhưng không trả về token
                throw new Error(loginResponse.message || "Login failed, no token received."); // [cite: 875]
            }
        } catch (error) {
            console.error('Login error in AuthProvider:', error.message || error); // [cite: 876]
            setUser(null); // [cite: 877]
            setIsAuthenticated(false); // [cite: 877]
            throw error; // Ném lỗi để màn hình Login có thể xử lý [cite: 877]
        } finally {
            setIsLoading(false); // [cite: 877]
        }
    };

    const register = async (userData) => { // { username, password, email } [cite: 878]
        try {
            setIsLoading(true); // [cite: 878]
            const response = await identityService.register(userData); // [cite: 879]
            // Sau khi đăng ký thành công, backend có thể không tự động login user
            // User sẽ cần đăng nhập sau khi đăng ký
            return response; // [cite: 879]
            // ApiResponse<UserResponse> (result có thể null)
        } catch (error) {
            console.error('Register error in AuthProvider:', error.message || error); // [cite: 880]
            throw error; // [cite: 881]
        } finally {
            setIsLoading(false); // [cite: 881]
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true); // [cite: 882]
            await identityService.logout(); // Xử lý cả API call và AsyncStorage [cite: 883]
            setUser(null); // [cite: 883]
            setIsAuthenticated(false); // [cite: 884]
            router.replace('/(auth)/login'); // [cite: 884]
            console.log('User logged out and redirected to login.'); // [cite: 884]
        } catch (error) {
            // Lỗi ở đây thường là lỗi mạng khi gọi API logout, AsyncStorage vẫn sẽ được xóa
            console.error('Logout error in AuthProvider:', error.message || error); // [cite: 884]
            // Đảm bảo trạng thái local được reset ngay cả khi API logout thất bại
            setUser(null); // [cite: 885]
            setIsAuthenticated(false); // [cite: 886]
            router.replace('/(auth)/login'); // [cite: 886]
        } finally {
            setIsLoading(false); // [cite: 886]
        }
    };

    const sendOtpForgotPassword = async (username) => {
        try {
            return await identityService.sendOtpForgotPassword(username); // [cite: 887]
        } catch (error) {
            console.error('Forgot password (send OTP) error in AuthProvider:', error.message || error); // [cite: 888]
            throw error; // [cite: 889]
        }
    };

    const verifyOtpAndGetResetToken = async (username, otp) => {
        try {
            const response = await identityService.verifyOtpForgotPassword(username, otp); // [cite: 889]
            // response.result.verificationToken
            return response; // [cite: 890]
            // Trả về toàn bộ ApiResponse để màn hình có thể lấy token
        } catch (error) {
            console.error('Verify OTP error in AuthProvider:', error.message || error); // [cite: 891]
            throw error; // [cite: 892]
        }
    };

    const resetPasswordWithVerificationToken = async (newPassword, verificationToken) => {
        try {
            return await identityService.resetPasswordWithToken(newPassword, verificationToken); // [cite: 892]
        } catch (error) {
            console.error('Reset password error in AuthProvider:', error.message || error); // [cite: 893]
            throw error; // [cite: 894]
        }
    };

    // Cập nhật email
    const updateMyEmail = async (email) => {
        try {
            setIsLoading(true); // [cite: 894]
            const response = await profileService.updateMyInfo({email}); // identityService.updateMyInfo mong muốn { email } [cite: 895]
            if (response && response.result) {
                setUser(prevUser => ({...prevUser, ...response.result})); // [cite: 895]
                // Cập nhật user state với thông tin mới
                await identityService.setCurrentUser(response.result); // [cite: 896]
                // Cập nhật AsyncStorage
            }
            return response; // [cite: 897]
        } catch (error) {
            console.error('Update email error in AuthProvider:', error.message || error); // [cite: 898]
            throw error; // [cite: 899]
        } finally {
            setIsLoading(false); // [cite: 899]
        }
    };

    // Cập nhật mật khẩu
    const updateMyPassword = async (oldPassword, newPassword) => {
        if (!user || !user.id) {
            console.error("User ID not available for password update."); // [cite: 900]
            throw new Error("User not authenticated or ID missing."); // [cite: 901]
        }
        try {
            return await identityService.updateMyPassword(user.id, {oldPassword, newPassword}); // [cite: 901]
        } catch (error) {
            console.error('Update password error in AuthProvider:', error.message || error); // [cite: 902]
            throw error; // [cite: 903]
        }
    };

    // Cập nhật ảnh đại diện
    const updateMyProfileImage = async (profileImageFile) => {
        try {
            setIsLoading(true); // [cite: 903]
            // Hoặc một state loading riêng cho việc update ảnh
            // identityService.updateMyProfileImage đã bao gồm logic gọi API và cập nhật AsyncStorage
            const response = await identityService.updateMyProfileImage(profileImageFile); // [cite: 904]

            if (response && response.status === 200) {
                setUser(response.result); // This will trigger re-renders in consumers
                console.log('AuthContext user state updated with new profile info:', response.result);
                attemptLoadUser()
            }
            return response; // [cite: 907]
            // Trả về response đầy đủ để component xử lý
        } catch (error) {
            console.error('Update profile image error in AuthContext:', error); // [cite: 908]
            throw error; // Ném lỗi để component xử lý [cite: 909]
        } finally {
            setIsLoading(false); // [cite: 909]
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
        updateMyProfileImage, // Các hàm khác liên quan đến profile chi tiết (tên, địa chỉ) sẽ gọi profileService [cite: 910, 911]
        // và có thể không cần thiết phải nằm trong AuthContext nếu chúng không ảnh hưởng trực tiếp đến trạng thái auth.
    }; // [cite: 912]

    return (<AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>); // [cite: 912]
};

export const useAuth = () => {
    const context = useContext(AuthContext); // [cite: 913]
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider'); // [cite: 914]
    }
    return context; // [cite: 915]
};

export default AuthContext; // [cite: 915]