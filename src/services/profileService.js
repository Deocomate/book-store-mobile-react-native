

/*
####################################################################
# profileService.js (Replaces userService.js)
####################################################################
*/
// src/services/profileService.js
import api from './api';
import identityService from './identityService'; // To update current user info locally

const profileService = {
    // GET /identity/users/info (lấy thông tin user hiện tại - đã có trong identityService, nhưng profileService có thể wrap nó)
    getMyInfo: async () => {
        try {
            const response = await api.get('/identity/users/info'); // Path from UserController
            if (response && response.result) {
                await identityService.setCurrentUser(response.result);
            }
            return response; // ApiResponse<UserResponse>
        } catch (error) {
            console.error('Get my info (profile context) failed:', error.message || error);
            throw error;
        }
    },

    // PUT /identity/users/info (cập nhật thông tin user hiện tại)
    updateMyInfo: async (userInfo) => { // userInfo: { email } based on UserUpdateInfoRequest
        try {
            const response = await api.put('/identity/users/info', userInfo); // Path from UserController
            if (response && response.result) {
                await identityService.setCurrentUser(response.result);
            }
            return response; // ApiResponse<UserResponse>
        } catch (error) {
            console.error('Update my info (profile context) failed:', error.message || error);
            throw error;
        }
    },

    // GET /identity/users/{userId} (Lấy thông tin user theo ID)
    getUserProfileById: async (userId) => {
        try {
            const response = await api.get(`/identity/users/${userId}`); // Path from UserController
            return response; // ApiResponse<UserResponse>
        } catch (error) {
            console.error(`Get user profile for ${userId} failed:`, error.message || error);
            throw error;
        }
    },

    // === Profile/Address specific endpoints from ProfileController ===
    // POST /profile
    createShippingProfile: async (profileData) => {
        // profileData: { fullName, phone, address, gender ("MALE" | "FEMALE") }
        try {
            const response = await api.post('/profile', profileData);
            return response; // ApiResponse<ProfileResponse>
        } catch (error) {
            console.error('Create shipping profile failed:', error.message || error);
            throw error;
        }
    },

    // GET /profile/my-profile
    getMyShippingProfiles: async (pageIndex = 1, pageSize = 10) => {
        try {
            // Backend ProfileService uses 1-based pageIndex
            const response = await api.get('/profile/my-profile', { params: { pageIndex, pageSize } });
            return response; // ApiResponse<PageResponse<ProfileResponse>>
        } catch (error) {
            console.error('Get my shipping profiles failed:', error.message || error);
            throw error;
        }
    },

    // PUT /profile/{profileId}
    updateShippingProfile: async (profileId, profileData) => {
        // profileData: { fullName, phone, address, gender }
        try {
            const response = await api.put(`/profile/${profileId}`, profileData);
            return response; // ApiResponse<ProfileResponse>
        } catch (error) {
            console.error(`Update shipping profile ${profileId} failed:`, error.message || error);
            throw error;
        }
    },

    // GET /profile/{profileId}
    getShippingProfileById: async (profileId) => {
        try {
            const response = await api.get(`/profile/${profileId}`);
            return response; // ApiResponse<ProfileResponse>
        } catch (error) {
            console.error(`Get shipping profile ${profileId} failed:`, error.message || error);
            throw error;
        }
    },

    // DELETE /profile/{profileId}
    deleteShippingProfile: async (profileId) => {
        try {
            const response = await api.delete(`/profile/${profileId}`);
            return response; // ApiResponse<String>
        } catch (error) {
            console.error(`Delete shipping profile ${profileId} failed:`, error.message || error);
            throw error;
        }
    },
};
export default profileService;