
/* ===== src/screens/account/EditProfileScreen.jsx ===== */
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// This screen will manage editing user's full name, phone, gender from the `Profiles` table.
// The `UserResponse` from `identityService` (in `AuthContext.user`) mainly has `username, email, profileImage`.
// We might need a separate fetch for the detailed profile if not already combined.
// For now, we'll focus on email update (via AuthContext) and placeholders for other fields.

function EditProfileScreen() {
    const { user, updateMyEmail, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    // Add states for other profile fields if you fetch/update them
    // e.g., const [fullName, setFullName] = useState('');
    // const [phone, setPhone] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [screenLoading, setScreenLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null); // For detailed profile from /profile/my-profile

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            // Fetch detailed shipping profile if needed
            const fetchProfileDetails = async () => {
                try {
                    // Assuming getMyShippingProfiles returns a PageResponse<ProfileResponse>
                    // And we might want the first/default profile or allow selection.
                    // For simplicity, let's assume we can get a primary profile.
                    // This part needs to be adjusted based on your actual API for fetching *the* user's profile details.
                    // If profileService.getMyInfo already contains everything, this fetch is not needed.
                    // Based on current profileService, there isn't a single "get my full profile" endpoint.
                    // We'll simulate or use placeholder for now for fullName, phone.
                    // const profileResponse = await profileService.getMyShippingProfiles({ pageIndex: 1, pageSize: 1 });
                    // if (profileResponse && profileResponse.result && profileResponse.result.data.length > 0) {
                    //     const mainProfile = profileResponse.result.data[0];
                    //     setFullName(mainProfile.fullName || '');
                    //     setPhone(mainProfile.phone || '');
                    //     // setGender(mainProfile.gender || '');
                    // }
                    setScreenLoading(false);
                } catch (error) {
                    console.error("Failed to fetch profile details:", error);
                    Alert.alert("Lỗi", "Không thể tải thông tin chi tiết hồ sơ.");
                    setScreenLoading(false);
                }
            };
            fetchProfileDetails();
        } else {
            setScreenLoading(false);
        }
    }, [user]);


    const handleSaveChanges = async () => {
        if (!email.trim()) {
            Alert.alert("Lỗi", "Email không được để trống.");
            return;
        }
        // Add validation for other fields if they are being edited.

        setIsSubmitting(true);
        try {
            // Update email via AuthContext
            if (email !== user?.email) {
                const emailUpdateResponse = await updateMyEmail(email); // updateMyEmail is from AuthContext
                if (!emailUpdateResponse || emailUpdateResponse.status !== 200) {
                    Alert.alert("Lỗi cập nhật Email", emailUpdateResponse?.message || "Không thể cập nhật email.");
                    setIsSubmitting(false);
                    return;
                }
            }

            // TODO: Update other profile details (fullName, phone) using profileService.updateShippingProfile
            // This would require knowing the profileId.
            // Example:
            // if (userProfile && (fullName !== userProfile.fullName || phone !== userProfile.phone)) {
            //    await profileService.updateShippingProfile(userProfile.id, { fullName, phone, address: userProfile.address, gender: userProfile.gender });
            // }

            Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật.");
            // Optionally navigate back or refresh data
        } catch (error) {
            console.error("Save profile error:", error);
            Alert.alert("Lỗi", error?.message || "Không thể lưu thay đổi. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (screenLoading || (authLoading && !user)) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0EA5E9" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="p-5 space-y-5">
                    {/* Username (Display only) */}
                    <View>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Tên đăng nhập</Text>
                        <TextInput
                            className="bg-gray-200 text-gray-700 p-3.5 rounded-lg text-base"
                            value={user?.username || ''}
                            editable={false} // Username usually not editable by user directly
                        />
                    </View>

                    {/* Email */}
                    <View>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Email</Text>
                        <TextInput
                            className="bg-white border border-gray-300 text-gray-800 p-3.5 rounded-lg text-base focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isSubmitting}
                        />
                    </View>

                    {/* Placeholder for Full Name - requires profileService integration */}
                    <View>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Họ và Tên (Chức năng đang phát triển)</Text>
                        <TextInput
                            className="bg-gray-200 text-gray-700 p-3.5 rounded-lg text-base"
                            placeholder="Nguyễn Văn A"
                            // value={fullName}
                            // onChangeText={setFullName}
                            editable={false} // Enable when profileService for this is integrated
                        />
                    </View>

                    {/* Placeholder for Phone - requires profileService integration */}
                    <View>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Số điện thoại (Chức năng đang phát triển)</Text>
                        <TextInput
                            className="bg-gray-200 text-gray-700 p-3.5 rounded-lg text-base"
                            placeholder="09xxxxxxxx"
                            // value={phone}
                            // onChangeText={setPhone}
                            keyboardType="phone-pad"
                            editable={false} // Enable when profileService for this is integrated
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSaveChanges}
                        disabled={isSubmitting || authLoading}
                        className={`py-4 rounded-lg shadow-md mt-5 ${isSubmitting || authLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-center text-lg font-semibold">Lưu Thay Đổi</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default EditProfileScreen;
