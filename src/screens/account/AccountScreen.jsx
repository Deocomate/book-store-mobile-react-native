// src/screens/account/AccountScreen.jsx
import {useAuth} from '@/contexts/AuthContext';
import {Feather, Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View
} from 'react-native';

import {dataURIToBlob} from '@/utils/imageUtils';

// Default placeholder image if user.profileImage is null or
const DEFAULT_AVATAR_URL = 'https://placehold.co/200x200/E2E8F0/A0AEC0?text=User';
// Nên lấy từ file .env hoặc một config chung
const FILE_DOWNLOAD_PREFIX = 'http://172.20.64.1:8888/api/v1/file/media/download/';


const OptionItem = ({
                        iconName,
                        iconType = "MaterialCommunityIcons",
                        title,
                        onPress,
                        isDestructive = false,
                        disabled = false
                    }) => {
    const IconComponent = iconType === "Ionicons" ? Ionicons : (iconType === "Feather" ? Feather : MaterialCommunityIcons);
    return (<TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`flex-row items-center bg-white p-4 border-b border-gray-100 ${disabled ? 'opacity-50' : 'active:bg-gray-50'}`}
    >
        <IconComponent name={iconName} size={22}
                       color={isDestructive ? "#EF4444" : (disabled ? "#9CA3AF" : "#4B5563")}/>
        <Text
            className={`flex-1 ml-4 text-base ${isDestructive ? 'text-red-600' : (disabled ? 'text-gray-400' : 'text-gray-700')}`}>
            {title}
        </Text>
        {!isDestructive && !disabled && <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF"/>}
    </TouchableOpacity>);
};

function AccountScreen() {
    const router = useRouter();
    const {user, logout, updateMyProfileImage, isLoading: authIsLoading} = useAuth();
    const [isUpdatingProfileImage, setIsUpdatingProfileImage] = useState(false);
    const [localUser, setLocalUser] = useState(user);

    useEffect(() => {
        setLocalUser(user); // Sync localUser when user from context changes
    }, [user]);

    const requestMediaLibraryPermissions = async () => {
        if (Platform.OS !== 'web') {
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Quyền truy cập bị từ chối', 'Rất tiếc, chúng tôi cần quyền truy cập thư viện ảnh để bạn có thể thay đổi ảnh đại diện!');
                return false;
            }
        }
        return true; // Cho web, ImagePicker không yêu cầu quyền này một cách tường minh qua API này.
    };

    const handlePickImage = async () => {
        const hasPermission = await requestMediaLibraryPermissions();
        if (!hasPermission && Platform.OS !== 'web') { // Chỉ kiểm tra quyền cho non-web platforms
            return;
        }

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, // Chất lượng ảnh (0-1)
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const pickedImage = result.assets[0];
                console.log('📸 ImagePicker Result (pickedImage):', JSON.stringify(pickedImage, null, 2));

                let fileInput; // Sẽ là Blob cho web (từ dataURI), hoặc string URI cho native
                let finalFileName = pickedImage.fileName;
                let finalMimeType = pickedImage.mimeType;

                // Tạo tên file nếu không có
                if (!finalFileName) {
                    const uriParts = pickedImage.uri.split('.');
                    const extension = uriParts.length > 1 ? uriParts[uriParts.length - 1].split('?')[0].split('#')[0] : 'jpg';
                    finalFileName = `profile-${Date.now()}.${extension}`;
                }

                // Xử lý Data URI cho web
                if (Platform.OS === 'web' && pickedImage.uri.startsWith('data:')) {
                    console.log("URI is a data URI (web platform), attempting to convert to Blob...");
                    const blob = dataURIToBlob(pickedImage.uri);
                    if (blob) {
                        fileInput = blob;
                        finalMimeType = blob.type; // Sử dụng mimeType từ Blob
                        console.log("✅ Converted to Blob. Size:", blob.size, "Type:", finalMimeType);
                    } else {
                        Alert.alert("Lỗi xử lý ảnh", "Không thể chuyển đổi ảnh để tải lên.");
                        setIsUpdatingProfileImage(false); // Đảm bảo reset state
                        return;
                    }
                } else {
                    // Đối với native (iOS/Android), pickedImage.uri là một file URI
                    fileInput = pickedImage.uri;
                    // Cố gắng suy đoán mimeType nếu thiếu (cho native hoặc trường hợp web khác)
                    if (!finalMimeType) {
                        const uriParts = pickedImage.uri.split('.');
                        const extension = uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase().split('?')[0].split('#')[0] : '';
                        if (extension === 'jpg' || extension === 'jpeg') finalMimeType = 'image/jpeg'; else if (extension === 'png') finalMimeType = 'image/png'; else if (extension) finalMimeType = `image/${extension}`; // Có thể không chuẩn
                        else finalMimeType = 'application/octet-stream'; // Mặc định
                        console.log("ℹ️ Deduced MimeType:", finalMimeType, "from URI:", pickedImage.uri);
                    }
                }

                const imageFilePayload = {
                    fileInput: fileInput, fileName: finalFileName, mimeType: finalMimeType,
                };

                setIsUpdatingProfileImage(true);
                const response = await updateMyProfileImage(imageFilePayload);

                if (response && response.status === 200) {
                    Alert.alert("Thành công", response.message || "Ảnh đại diện đã được cập nhật.");
                } else {
                    Alert.alert("Lỗi cập nhật ảnh", response?.message || "Không thể cập nhật ảnh đại diện. Vui lòng thử lại.");
                }
            }
        } catch (error) {
            console.error("Error in AccountScreen handlePickImage:", JSON.stringify(error, null, 2));
            Alert.alert("Lỗi nghiêm trọng", error?.message || "Đã có lỗi xảy ra khi chọn hoặc tải ảnh lên.");
        } finally {
            setIsUpdatingProfileImage(false);
        }
    };

    const handleEditProfile = () => router.push('/(app)/account/edit-profile');
    const handleOrderHistory = () => router.push('/(app)/account/order-history/');
    const handleShippingAddresses = () => router.push('/(app)/account/addresses');
    const handleChangePassword = () => router.push('/(app)/account/change-password');
    const handleNotificationSettings = () => router.push('/(app)/notification');
    const handleHelpCenter = () => Alert.alert("Thông báo", "Chức năng trung tâm trợ giúp sẽ sớm được cập nhật.");
    const handleAboutApp = () => Alert.alert("BookStore App", "Phiên bản 1.0.0\n© 2025 BookStore Inc.");
    const handleTermsAndPolicies = () => Alert.alert("Thông báo", "Chức năng chính sách & điều khoản sẽ sớm được cập nhật.");

    const handleLogout = () => {
        Alert.alert("Xác nhận Đăng xuất", "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?", [{
            text: "Hủy", style: "cancel"
        }, {text: "Đăng xuất", onPress: async () => await logout(), style: "destructive"}]);
    };

    const accountOptions = [{
        title: "Chỉnh sửa thông tin", iconName: "account-edit-outline", onPress: handleEditProfile
    }, {title: "Lịch sử đơn hàng", iconName: "history", onPress: handleOrderHistory}, {
        title: "Địa chỉ giao hàng", iconName: "map-marker-outline", onPress: handleShippingAddresses
    }, {title: "Đổi mật khẩu", iconName: "lock-reset", onPress: handleChangePassword}, {
        title: "Cài đặt thông báo", iconName: "bell-outline", onPress: handleNotificationSettings
    },];

    const supportOptions = [{
        title: "Trung tâm trợ giúp", iconName: "help-circle-outline", onPress: handleHelpCenter
    }, {
        title: "Về ứng dụng", iconName: "information-outline", onPress: handleAboutApp
    }, {title: "Chính sách & Điều khoản", iconName: "shield-check-outline", onPress: handleTermsAndPolicies},];

    // Điều kiện loading: authIsLoading (từ context, cho tải user ban đầu)
    // isUpdatingProfileImage (local state, cho việc upload ảnh)
    if (authIsLoading && !localUser) { // Chỉ hiển thị loading toàn màn hình nếu user chưa được tải
        return (<SafeAreaView className="flex-1 justify-center items-center bg-slate-100">
            <ActivityIndicator size="large" color="#0EA5E9"/>
        </SafeAreaView>);
    }

    const displayName = localUser?.username || localUser?.email || "Người dùng";
    const displayEmail = localUser?.email || "Không có email";

    const profileImageUrlToDisplay = localUser?.profileImage ? (localUser.profileImage.startsWith('http') ? localUser.profileImage : `${FILE_DOWNLOAD_PREFIX}${localUser.profileImage}`) : DEFAULT_AVATAR_URL;

    console.log(profileImageUrlToDisplay)

    return (<SafeAreaView className="flex-1 bg-slate-100">
        <ScrollView showsVerticalScrollIndicator={false}>
            <View className="bg-sky-500 p-6 pt-10 items-center">
                <TouchableOpacity onPress={handlePickImage} disabled={isUpdatingProfileImage || authIsLoading}>
                    <Image
                        source={{uri: profileImageUrlToDisplay}}
                        className="w-24 h-24 rounded-full border-4 border-sky-400"
                        onError={(e) => console.warn("Failed to load profile image in AccountScreen Image:", e.nativeEvent.error, profileImageUrlToDisplay)}
                    />
                    {isUpdatingProfileImage && (
                        <View className="absolute inset-0 justify-center items-center bg-black/30 rounded-full">
                            <ActivityIndicator color="#FFFFFF"/>
                        </View>)}
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white mt-3">{displayName}</Text>
                <Text className="text-sm text-sky-100 mt-1">{displayEmail}</Text>
            </View>

            <View className="mt-5">
                <Text className="text-xs font-semibold text-gray-500 uppercase px-4 pb-1">Tài khoản</Text>
                <View className="bg-white rounded-lg shadow-sm mx-2 overflow-hidden">
                    {accountOptions.map((item, index) => (<OptionItem key={index} {...item}
                                                                      disabled={(isUpdatingProfileImage || authIsLoading) && item.onPress !== handleEditProfile}/>))}
                </View>
            </View>

            <View className="mt-5">
                <Text className="text-xs font-semibold text-gray-500 uppercase px-4 pb-1">Hỗ trợ & Pháp lý</Text>
                <View className="bg-white rounded-lg shadow-sm mx-2 overflow-hidden">
                    {supportOptions.map((item, index) => (
                        <OptionItem key={index} {...item} disabled={isUpdatingProfileImage || authIsLoading}/>))}
                </View>
            </View>

            <View className="mt-6 mb-8 mx-2">
                <View className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <OptionItem
                        iconName="log-out"
                        iconType="Feather"
                        title="Đăng xuất"
                        onPress={handleLogout}
                        isDestructive
                        disabled={isUpdatingProfileImage || authIsLoading}
                    />
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>);
}

export default AccountScreen;