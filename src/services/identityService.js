/*
####################################################################
# identityService.js (Replaces authService.js)
####################################################################
*/
// src/services/identityService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const CURRENT_USER_KEY = 'currentUser';

const identityService = {
    // === Authentication ===
    login: async (credentials) => { // credentials: { username, password }
        try {
            const response = await api.post('/identity/auth/login', credentials);
            if (response && response.result && response.result.token) {
                await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.result.token);
                // Assuming API might return refreshToken and user details upon login
                if (response.result.refreshToken) { // Hypothetical
                    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.result.refreshToken);
                }
                // Fetch and store user info after login if not included in login response
                // For now, we assume login response is sufficient or getMyInfo is called separately
            }
            return response; // ApiResponse<AuthenticationResponse>
        } catch (error) {
            console.error('Login failed in identityService:', error.message || error);
            throw error;
        }
    },

    logout: async () => {
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                await api.post('/identity/auth/logout', { token });
            }
        } catch (apiError) {
            console.error('API Logout failed, proceeding with local logout:', apiError.message || apiError);
        } finally {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            await AsyncStorage.removeItem(CURRENT_USER_KEY);
            console.log('Logged out locally, tokens and user info removed.');
        }
    },

    introspectToken: async (token) => {
        try {
            const response = await api.post('/identity/auth/introspect', { token });
            return response; // ApiResponse<IntrospectResponse>
        } catch (error) {
            console.error('Introspect token failed:', error.message || error);
            throw error;
        }
    },

    refreshToken: async () => {
        const currentRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!currentRefreshToken) {
            console.log('No refresh token available for refreshing session.');
            await identityService.logout();
            throw new Error('No refresh token available.');
        }
        try {
            const response = await api.post('/identity/auth/refresh-token', { token: currentRefreshToken });
            if (response && response.result && response.result.token) {
                await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.result.token);
                // if (response.result.refreshToken) { // If API provides a new refresh token
                //    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.result.refreshToken);
                // }
                return response.result.token;
            }
            await identityService.logout();
            throw new Error('Failed to refresh token, new token not received.');
        } catch (error) {
            console.error('Refresh token API call failed:', error.message || error);
            await identityService.logout();
            throw error;
        }
    },

    // === Password Recovery ===
    sendOtpForgotPassword: async (username) => {
        try {
            const response = await api.post('/identity/auth/password-recovery/otp', { username });
            return response; // ApiResponse<string>
        } catch (error) {
            console.error('Send OTP for forgot password failed:', error.message || error);
            throw error;
        }
    },

    verifyOtpForgotPassword: async (username, otp) => {
        try {
            const response = await api.post('/identity/auth/password-recovery/otp/verify', { username, otp });
            return response; // ApiResponse<VerifyOtpResponse>
        } catch (error) {
            console.error('Verify OTP for forgot password failed:', error.message || error);
            throw error;
        }
    },

    resetPasswordWithToken: async (newPassword, verificationToken) => {
        try {
            const response = await api.post('/identity/auth/password-recovery/reset', { newPassword, verificationToken });
            return response; // ApiResponse<string>
        } catch (error) {
            console.error('Reset password failed:', error.message || error);
            throw error;
        }
    },

    // === User Management ===
    register: async (userData) => { // userData: { username, password, email }
        try {
            const response = await api.post('/identity/users/register', userData);
            return response; // ApiResponse<UserResponse>
        } catch (error) {
            console.error('Registration failed in identityService:', error.message || error);
            throw error;
        }
    },

    // === Profile Management (moved to profileService, but some user-specific identity calls remain here) ===
    updateMyProfileImage: async (profileImageFile) => {
        // profileImageFile: { uri, fileName, mimeType }
        const formData = new FormData();
        formData.append('profileImage', {
            uri: profileImageFile.uri,
            name: profileImageFile.fileName || `profile-${Date.now()}.${profileImageFile.uri.split('.').pop()}`,
            type: profileImageFile.mimeType || 'image/jpeg',
        });
        try {
            const response = await api.put('/identity/users/profile-image', formData); // Note: API spec shows param, but controller takes RequestPart
            if (response && response.result) {
                const currentUser = await identityService.getCurrentUser();
                if (currentUser) {
                    await identityService.setCurrentUser({ ...currentUser, profileImage: response.result.profileImage });
                }
            }
            return response; // ApiResponse<UserResponse>
        } catch (error) {
            console.error('Update my profile image failed:', error.message || error);
            throw error;
        }
    },

    updateMyPassword: async (userId, passwords) => { // passwords: { oldPassword, newPassword }
        try {
            const response = await api.patch(`/identity/users/${userId}/password`, passwords);
            return response; // ApiResponse<UserResponse>
        } catch (error) {
            console.error(`Update password for user ${userId} failed:`, error.message || error);
            throw error;
        }
    },

    // === Admin/Role Specific (usually not called from basic mobile client but included for completeness) ===
    getAllUsersForAdmin: async (pageIndex = 1, pageSize = 10) => {
        try {
            // Backend UserController uses 0-based pageIndex
            const response = await api.get('/identity/users', { params: { pageIndex: pageIndex > 0 ? pageIndex - 1 : 0, pageSize } });
            return response; // ApiResponse<PageResponse<UserResponse>>
        } catch (error) {
            console.error('Admin: Get all users failed:', error.message || error);
            throw error;
        }
    },

    updateUserAsAdmin: async (userId, userData) => { // userData: { password, email, roles }
        try {
            const response = await api.put(`/identity/users/${userId}`, userData);
            return response; // ApiResponse<UserResponse>
        } catch (error) {
            console.error(`Admin: Update user ${userId} failed:`, error.message || error);
            throw error;
        }
    },

    deleteUserAsAdmin: async (userId) => {
        try {
            const response = await api.delete(`/identity/users/${userId}`);
            return response; // ApiResponse<UserResponse>
        } catch (error) {
            console.error(`Admin: Delete user ${userId} failed:`, error.message || error);
            throw error;
        }
    },

    seedUsersAsAdmin: async (numberOfRecords) => {
        try {
            const response = await api.post(`/identity/users/seeding/${numberOfRecords}`);
            return response; // ApiResponse<String>
        } catch (error) {
            console.error('Admin: Seed users failed:', error.message || error);
            throw error;
        }
    },

    // Permissions (Admin only)
    createPermission: async (permissionData) => { // { name, description }
        try {
            const response = await api.post('/identity/permissions', permissionData);
            return response; // ApiResponse<PermissionResponse>
        } catch (error) {
            throw error;
        }
    },
    getAllPermissions: async () => {
        try {
            const response = await api.get('/identity/permissions');
            return response; // ApiResponse<List<PermissionResponse>>
        } catch (error) {
            throw error;
        }
    },
    deletePermission: async (permissionName) => {
        try {
            const response = await api.delete(`/identity/permissions/${permissionName}`);
            return response; // ApiResponse<PermissionResponse>
        } catch (error) {
            throw error;
        }
    },

    // Roles (Admin only)
    createRole: async (roleData) => { // { name, description, permissions: ["perm1"] }
        try {
            const response = await api.post('/identity/roles', roleData);
            return response; // ApiResponse<RoleResponse>
        } catch (error) {
            throw error;
        }
    },
    getAllRoles: async () => {
        try {
            const response = await api.get('/identity/roles');
            return response; // ApiResponse<List<RoleResponse>>
        } catch (error) {
            throw error;
        }
    },
    deleteRole: async (roleName) => {
        try {
            const response = await api.delete(`/identity/roles/${roleName}`);
            return response; // ApiResponse<RoleResponse>
        } catch (error) {
            throw error;
        }
    },


    // === AsyncStorage Helpers ===
    getAuthToken: async () => AsyncStorage.getItem(AUTH_TOKEN_KEY),
    getRefreshToken: async () => AsyncStorage.getItem(REFRESH_TOKEN_KEY),
    getCurrentUser: async () => {
        const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },
    setCurrentUser: async (userData) => {
        if (userData) {
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
        } else {
            await AsyncStorage.removeItem(CURRENT_USER_KEY);
        }
    },
    isAuthenticated: async () => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        return !!token; // True if token exists and is not empty
    },
};
export default identityService;