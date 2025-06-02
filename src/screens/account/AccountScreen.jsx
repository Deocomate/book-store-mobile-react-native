/* ===== src/screens/account/AccountScreen.jsx ===== */
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Default placeholder image if user.profileImage is null or
const DEFAULT_AVATAR_URL = 'https://placehold.co/200x200/E2E8F0/A0AEC0?text=User';

const OptionItem = ({ iconName, iconType = "MaterialCommunityIcons", title, onPress, isDestructive = false, disabled = false }) => {
    const IconComponent = iconType === "Ionicons" ? Ionicons : (iconType === "Feather" ? Feather : MaterialCommunityIcons);
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`flex-row items-center bg-white p-4 border-b border-gray-100 ${disabled ? 'opacity-50' : 'active:bg-gray-50'}`}
        >
            <IconComponent name={iconName} size={22} color={isDestructive ? "#EF4444" : (disabled ? "#9CA3AF" : "#4B5563")} />
            <Text className={`flex-1 ml-4 text-base ${isDestructive ? 'text-red-600' : (disabled ? 'text-gray-400' : 'text-gray-700')}`}>
                {title}
            </Text>
            {!isDestructive && !disabled && <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />}
        </TouchableOpacity>
    );
};

function AccountScreen() {
    const router = useRouter();
    const { user, logout, updateMyProfileImage, isLoading: authIsLoading } = useAuth();
    const [isUpdatingProfileImage, setIsUpdatingProfileImage] = useState(false);
    const [localUser, setLocalUser] = useState(user);

    useEffect(() => {
        setLocalUser(user); // Sync localUser when user from context changes
    }, [user]);

    const requestMediaLibraryPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Quyền truy cập bị từ chối', 'Rất tiếc, chúng tôi cần quyền truy cập thư viện ảnh để bạn có thể thay đổi ảnh đại diện!');
                return false;
            }
            return true;
        }
        return true; // Permissions not typically needed for web in the same way
    };

    const handlePickImage = async () => {
        const hasPermission = await requestMediaLibraryPermissions();
        if (!hasPermission) return;

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7, // Compress image slightly
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const pickedImage = result.assets[0];
                const imageFile = {
                    uri: pickedImage.uri,
                    fileName: pickedImage.fileName || `profile-${Date.now()}.${pickedImage.uri.split('.').pop()}`,
                    mimeType: pickedImage.mimeType || 'image/jpeg',
                };

                setIsUpdatingProfileImage(true);
                const response = await updateMyProfileImage(imageFile); // This function is from AuthContext

                if (response && response.status === 200 && response.result) {
                    // AuthContext should update the user state, which will flow down here.
                    // No need to call setLocalUser directly if AuthContext handles user state update properly.
                    Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật.");
                } else {
                    Alert.alert("Lỗi", response?.message || "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.");
                }
            }
        } catch (error) {
            console.error("Error picking/uploading image:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn hoặc tải ảnh lên.");
        } finally {
            setIsUpdatingProfileImage(false);
        }
    };


    const handleEditProfile = () => {
        router.push('/(app)/account/edit-profile');
    };

    const handleOrderHistory = () => {
        router.push('/(app)/account/order-history');
    };

    const handleShippingAddresses = () => {
        router.push('/(app)/account/addresses');
    };

    const handleChangePassword = () => {
        router.push('/(app)/account/change-password');
    };

    const handleNotificationSettings = () => {
        router.push('/(app)/notification');
    };

    const handleHelpCenter = () => {
        Alert.alert("Thông báo", "Chức năng trung tâm trợ giúp sẽ sớm được cập nhật.");
    };

    const handleAboutApp = () => {
        Alert.alert("BookStore App", "Phiên bản 1.0.0\n© 2025 BookStore Inc.");
    };

    const handleTermsAndPolicies = () => {
        Alert.alert("Thông báo", "Chức năng chính sách & điều khoản sẽ sớm được cập nhật.");
    };

    const handleLogout = () => {
        Alert.alert(
            "Xác nhận Đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đăng xuất",
                    onPress: async () => {
                        await logout();
                        // AuthContext should handle navigation to login screen
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const accountOptions = [
        { title: "Chỉnh sửa thông tin", iconName: "account-edit-outline", onPress: handleEditProfile },
        { title: "Lịch sử đơn hàng", iconName: "history", onPress: handleOrderHistory },
        { title: "Địa chỉ giao hàng", iconName: "map-marker-outline", onPress: handleShippingAddresses },
        { title: "Đổi mật khẩu", iconName: "lock-reset", onPress: handleChangePassword },
        { title: "Cài đặt thông báo", iconName: "bell-outline", onPress: handleNotificationSettings },
    ];

    const supportOptions = [
        { title: "Trung tâm trợ giúp", iconName: "help-circle-outline", onPress: handleHelpCenter },
        { title: "Về ứng dụng", iconName: "information-outline", onPress: handleAboutApp },
        { title: "Chính sách & Điều khoản", iconName: "shield-check-outline", onPress: handleTermsAndPolicies },
    ];

    if (authIsLoading && !localUser) { // Show loading only if user data is not yet available
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-100">
                <ActivityIndicator size="large" color="#0EA5E9" />
            </SafeAreaView>
        );
    }

    // Determine the display name. UserResponse has `username`. If `fullName` is desired,
    // it might come from a separate profile fetch or be added to UserResponse.
    // For now, using username, or email as fallback.
    const displayName = localUser?.username || localUser?.email || "Người dùng";
    const displayEmail = localUser?.email || "Không có email";
    const profileImageUrl = localUser?.profileImage || DEFAULT_AVATAR_URL;


    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* User Info Section */}
                <View className="bg-sky-500 p-6 pt-10 items-center">
                    <TouchableOpacity onPress={handlePickImage} disabled={isUpdatingProfileImage}>
                        <Image
                            source={{ uri: profileImageUrl }}
                            className="w-24 h-24 rounded-full border-4 border-sky-400"
                            onError={() => console.log("Failed to load profile image, using default.")} // Fallback handled by DEFAULT_AVATAR_URL logic
                        />
                        {isUpdatingProfileImage && (
                            <View className="absolute inset-0 justify-center items-center bg-black/30 rounded-full">
                                <ActivityIndicator color="#FFFFFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white mt-3">{displayName}</Text>
                    <Text className="text-sm text-sky-100 mt-1">{displayEmail}</Text>
                </View>

                {/* Account Options Section */}
                <View className="mt-5">
                    <Text className="text-xs font-semibold text-gray-500 uppercase px-4 pb-1">Tài khoản</Text>
                    <View className="bg-white rounded-lg shadow-sm mx-2 overflow-hidden">
                        {accountOptions.map((item, index) => (
                            <OptionItem
                                key={index}
                                iconName={item.iconName}
                                title={item.title}
                                onPress={item.onPress}
                                disabled={authIsLoading} // Disable options while auth state is resolving
                            />
                        ))}
                    </View>
                </View>

                {/* Support Options Section */}
                <View className="mt-5">
                    <Text className="text-xs font-semibold text-gray-500 uppercase px-4 pb-1">Hỗ trợ & Pháp lý</Text>
                    <View className="bg-white rounded-lg shadow-sm mx-2 overflow-hidden">
                        {supportOptions.map((item, index) => (
                            <OptionItem
                                key={index}
                                iconName={item.iconName}
                                title={item.title}
                                onPress={item.onPress}
                                disabled={authIsLoading}
                            />
                        ))}
                    </View>
                </View>

                {/* Logout Button */}
                <View className="mt-6 mb-8 mx-2">
                    <View className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <OptionItem
                            iconName="log-out"
                            iconType="Feather"
                            title="Đăng xuất"
                            onPress={handleLogout}
                            isDestructive
                            disabled={authIsLoading}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default AccountScreen;