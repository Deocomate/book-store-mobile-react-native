import { useAuth } from '@/contexts/AuthContext';
import { customerService } from '@/services';
import { dataURIToBlob } from '@/utils/imageUtils';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const DEFAULT_AVATAR_URL = 'https://placehold.co/200x200/E2E8F0/A0AEC0?text=User';
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
            color={isDestructive ? "#EF4444" : (disabled ? "#9CA3AF" : "#4B5563")} />
        <Text
            className={`flex-1 ml-4 text-base ${isDestructive ? 'text-red-600' : (disabled ? 'text-gray-400' : 'text-gray-700')}`}>
            {title}
        </Text>
        {!isDestructive && !disabled && <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />}
    </TouchableOpacity>);
};

const InfoModal = ({ visible, title, content, onClose }) => (<Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
>
    <View style={styles.modalOverlay}>
        <View className="bg-white w-11/12 max-w-md p-6 rounded-xl shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-sky-700">{title}</Text>
                <TouchableOpacity onPress={onClose} className="p-1">
                    <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
                <Text className="text-gray-700 text-base leading-relaxed">{content}</Text>
            </ScrollView>
            <TouchableOpacity
                onPress={onClose}
                className="mt-6 bg-sky-500 py-3 rounded-lg shadow active:bg-sky-600"
            >
                <Text className="text-white text-center font-semibold text-base">Đã hiểu</Text>
            </TouchableOpacity>
        </View>
    </View>
</Modal>);

const CustomerCareModal = ({ visible, onClose, onSubmit, isLoading }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [content, setContent] = useState('');
    const [formError, setFormError] = useState('');

    const handleSubmit = () => {
        setFormError('');
        if (!name.trim() || !phone.trim() || !email.trim() || !content.trim()) {
            setFormError("Vui lòng điền đầy đủ các trường bắt buộc: Họ tên, SĐT, Email và Nội dung.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setFormError("Địa chỉ email không hợp lệ.");
            return;
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setFormError("Số điện thoại không hợp lệ (yêu cầu 10 chữ số).");
            return;
        }

        onSubmit({ name, phone, email, address: address.trim(), content });
    };

    return (<Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View className="bg-white w-11/12 max-w-lg p-5 rounded-xl shadow-xl">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-sky-700">Gửi Yêu Cầu Hỗ Trợ</Text>
                    <TouchableOpacity onPress={onClose} className="p-1" disabled={isLoading}>
                        <Ionicons name="close-circle" size={28} color="#6B7280" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: Platform.OS === 'ios' ? 400 : 350 }}
                    keyboardShouldPersistTaps="handled">
                    {formError ? (<View className="bg-red-100 p-3 rounded-md mb-3">
                        <Text className="text-red-700 text-sm">{formError}</Text>
                    </View>) : null}
                    {/* Thay đổi: Tăng khoảng cách với space-y-4 */}
                    <View className="space-y-4">
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Họ và tên (*)"
                            placeholderTextColor="#9CA3AF" // Thêm: Màu cho placeholder
                            className="border border-gray-300 p-3 rounded-lg text-base bg-white focus:border-sky-500 mb-3" // Thêm: Style khi focus
                            editable={!isLoading} />
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Số điện thoại (*)"
                            placeholderTextColor="#9CA3AF" // Thêm: Màu cho placeholder
                            keyboardType="phone-pad"
                            className="border border-gray-300 p-3 rounded-lg text-base bg-white focus:border-sky-500 mb-3" // Thêm: Style khi focus
                            editable={!isLoading} />
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email (*)"
                            placeholderTextColor="#9CA3AF" // Thêm: Màu cho placeholder
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="border border-gray-300 p-3 rounded-lg text-base bg-white focus:border-sky-500 mb-3" // Thêm: Style khi focus
                            editable={!isLoading} />
                        <TextInput
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Địa chỉ (Không bắt buộc)"
                            placeholderTextColor="#9CA3AF" // Thêm: Màu cho placeholder
                            className="border border-gray-300 p-3 rounded-lg text-base bg-white focus:border-sky-500 mb-3" // Thêm: Style khi focus
                            editable={!isLoading} />
                        <TextInput
                            value={content}
                            onChangeText={setContent}
                            placeholder="Nội dung yêu cầu (*)"
                            placeholderTextColor="#9CA3AF" // Thêm: Màu cho placeholder
                            multiline
                            numberOfLines={4}
                            className="border border-gray-300 p-3 rounded-lg text-base h-28 bg-white focus:border-sky-500" // Thêm: Style khi focus
                            textAlignVertical="top"
                            editable={!isLoading} />
                    </View>
                </ScrollView>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className={`mt-5 py-3 rounded-lg shadow ${isLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                >
                    {isLoading ? <ActivityIndicator color="white" /> :
                        <Text className="text-white text-center font-semibold text-base">Gửi Yêu Cầu</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </Modal>);
};


function AccountScreen() {
    const router = useRouter();
    const { user, logout, updateMyProfileImage, isLoading: authIsLoading } = useAuth();
    const [isUpdatingProfileImage, setIsUpdatingProfileImage] = useState(false);
    const [localUser, setLocalUser] = useState(user);

    const [customerCareModalVisible, setCustomerCareModalVisible] = useState(false);
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);

    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [infoModalContent, setInfoModalContent] = useState({ title: '', content: '' });


    useEffect(() => {
        setLocalUser(user);
    }, [user]);

    const requestMediaLibraryPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Quyền truy cập bị từ chối', 'Rất tiếc, chúng tôi cần quyền truy cập thư viện ảnh để bạn có thể thay đổi ảnh đại diện!');
                return false;
            }
        }
        return true;
    };

    const handlePickImage = async () => {
        const hasPermission = await requestMediaLibraryPermissions();
        if (!hasPermission && Platform.OS !== 'web') {
            return;
        }

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const pickedImage = result.assets[0];
                let fileInput;
                let finalFileName = pickedImage.fileName;
                let finalMimeType = pickedImage.mimeType;

                if (!finalFileName) {
                    const uriParts = pickedImage.uri.split('.');
                    const extension = uriParts.length > 1 ? uriParts[uriParts.length - 1].split('?')[0].split('#')[0] : 'jpg';
                    finalFileName = `profile-${Date.now()}.${extension}`;
                }

                if (Platform.OS === 'web' && pickedImage.uri.startsWith('data:')) {
                    const blob = dataURIToBlob(pickedImage.uri);
                    if (blob) {
                        fileInput = blob;
                        finalMimeType = blob.type;
                    } else {
                        Alert.alert("Lỗi xử lý ảnh", "Không thể chuyển đổi ảnh để tải lên.");
                        return;
                    }
                } else {
                    fileInput = pickedImage.uri;
                    if (!finalMimeType) {
                        const uriParts = pickedImage.uri.split('.');
                        const extension = uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase().split('?')[0].split('#')[0] : '';
                        if (extension === 'jpg' || extension === 'jpeg') finalMimeType = 'image/jpeg'; else if (extension === 'png') finalMimeType = 'image/png'; else if (extension) finalMimeType = `image/${extension}`; else finalMimeType = 'application/octet-stream';
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
            Alert.alert("Lỗi nghiêm trọng", error?.message || "Đã có lỗi xảy ra khi chọn hoặc tải ảnh lên.");
        } finally {
            setIsUpdatingProfileImage(false);
        }
    };

    const handleSubmitCustomerCare = async (contactData) => {
        setIsSubmittingContact(true);
        try {
            const response = await customerService.createContact(contactData);
            console.log(response)
            if (response && response.status === 201) { // Assuming 201 for successful creation
                Alert.alert("Thành công", "Yêu cầu hỗ trợ của bạn đã được gửi đi.");
                setCustomerCareModalVisible(false);
            } else {
                Alert.alert("Lỗi", response?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
            }
        } catch (error) {
            Alert.alert("Lỗi", error?.message || "Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ.");
        } finally {
            setIsSubmittingContact(false);
        }
    };


    const handleOpenInfoModal = (title, content) => {
        setInfoModalContent({ title, content });
        setInfoModalVisible(true);
    };


    const handleEditProfile = () => router.push('/(app)/account/edit-profile');
    const handleOrderHistory = () => router.push('/(app)/account/order-history/');
    const handleShippingAddresses = () => router.push('/(app)/account/addresses');
    const handleChangePassword = () => router.push('/(app)/account/change-password');
    const handleNotificationSettings = () => router.push('/(app)/notification');

    const handleHelpCenter = () => handleOpenInfoModal("Trung Tâm Trợ Giúp", "Chào mừng bạn đến với Trung tâm Trợ giúp của BookStore!\n\n" + "Tại đây, bạn có thể tìm thấy câu trả lời cho các câu hỏi thường gặp về:\n" + "- Cách đặt hàng và thanh toán.\n" + "- Chính sách vận chuyển và giao nhận.\n" + "- Quy định đổi trả hàng hóa.\n" + "- Các vấn đề kỹ thuật và tài khoản.\n\n" + "Nếu không tìm thấy thông tin cần thiết, vui lòng liên hệ với chúng tôi qua mục 'Chăm sóc khách hàng' hoặc hotline 1900 1009.\n\n" + "Chúng tôi luôn sẵn sàng hỗ trợ bạn!");

    const handleAboutApp = () => handleOpenInfoModal("Về Ứng Dụng BookStore", "BookStore App - Phiên bản 1.0.0\n\n" + "© 2025 BookStore Inc. Mọi quyền được bảo lưu.\n\n" + "BookStore là ứng dụng mua sắm sách trực tuyến hàng đầu, mang đến cho bạn hàng ngàn đầu sách thuộc mọi thể loại với giá cả cạnh tranh và dịch vụ giao hàng nhanh chóng, tiện lợi.\n\n" + "Tính năng nổi bật:\n" + "- Tìm kiếm sách dễ dàng.\n" + "- Đặt hàng và thanh toán an toàn.\n" + "- Theo dõi đơn hàng trực tuyến.\n" + "- Nhận thông báo về sách mới và khuyến mãi.\n\n" + "Cảm ơn bạn đã tin tưởng và sử dụng BookStore!");

    const handleTermsAndPolicies = () => handleOpenInfoModal("Chính Sách & Điều Khoản", "Chào mừng bạn đến với các điều khoản và chính sách của BookStore.\n\n" + "1. Điều khoản sử dụng:\n" + "   - Vui lòng đọc kỹ các điều khoản trước khi sử dụng ứng dụng...\n\n" + "2. Chính sách bảo mật:\n" + "   - Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn...\n\n" + "3. Chính sách đổi trả:\n" + "   - Sản phẩm được đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất...\n\n" + "4. Chính sách vận chuyển:\n" + "   - Miễn phí vận chuyển cho đơn hàng từ 200.000đ...\n\n" + "Để biết thêm chi tiết, vui lòng truy cập website của chúng tôi hoặc liên hệ bộ phận hỗ trợ.");


    const handleLogout = () => {
        Alert.alert("Xác nhận Đăng xuất", "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?", [{
            text: "Hủy", style: "cancel"
        }, { text: "Đăng xuất", onPress: async () => await logout(), style: "destructive" }]);
    };

    const accountOptions = [{
        title: "Chỉnh sửa thông tin", iconName: "account-edit-outline", onPress: handleEditProfile
    }, { title: "Lịch sử đơn hàng", iconName: "history", onPress: handleOrderHistory }, {
        title: "Địa chỉ giao hàng", iconName: "map-marker-outline", onPress: handleShippingAddresses
    }, { title: "Đổi mật khẩu", iconName: "lock-reset", onPress: handleChangePassword }, {
        title: "Cài đặt thông báo", iconName: "bell-outline", onPress: handleNotificationSettings
    },];

    const supportOptions = [{
        title: "Chăm sóc khách hàng", iconName: "face-agent", onPress: () => setCustomerCareModalVisible(true)
    }, { title: "Trung tâm trợ giúp", iconName: "help-circle-outline", onPress: handleHelpCenter }, {
        title: "Về ứng dụng", iconName: "information-outline", onPress: handleAboutApp
    }, { title: "Chính sách & Điều khoản", iconName: "shield-check-outline", onPress: handleTermsAndPolicies },];

    if (authIsLoading && !localUser) {
        return (<SafeAreaView className="flex-1 justify-center items-center bg-slate-100">
            <ActivityIndicator size="large" color="#0EA5E9" />
        </SafeAreaView>);
    }

    const displayName = localUser?.username || localUser?.email || "Người dùng";
    const displayEmail = localUser?.email || "Không có email";
    const profileImageUrlToDisplay = localUser?.profileImage ? (localUser.profileImage.startsWith('http') ? localUser.profileImage : `${FILE_DOWNLOAD_PREFIX}${localUser.profileImage}`) : DEFAULT_AVATAR_URL;

    return (<SafeAreaView className="flex-1 bg-slate-100">
        <ScrollView showsVerticalScrollIndicator={false}>
            <View className="bg-sky-500 p-6 pt-10 items-center">
                <TouchableOpacity onPress={handlePickImage} disabled={isUpdatingProfileImage || authIsLoading}>
                    <Image
                        source={{ uri: profileImageUrlToDisplay }}
                        className="w-24 h-24 rounded-full border-4 border-sky-400"
                        onError={(e) => console.warn("Failed to load profile image:", e.nativeEvent.error, profileImageUrlToDisplay)}
                    />
                    {isUpdatingProfileImage && (
                        <View className="absolute inset-0 justify-center items-center bg-black/30 rounded-full">
                            <ActivityIndicator color="#FFFFFF" />
                        </View>)}
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white mt-3">{displayName}</Text>
                <Text className="text-sm text-sky-100 mt-1">{displayEmail}</Text>
            </View>

            <View className="mt-5">
                <Text className="text-xs font-semibold text-gray-500 uppercase px-4 pb-1">Tài khoản</Text>
                <View className="bg-white rounded-lg shadow-sm mx-2 overflow-hidden">
                    {accountOptions.map((item, index) => (<OptionItem key={index} {...item}
                        disabled={(isUpdatingProfileImage || authIsLoading) && item.onPress !== handleEditProfile} />))}
                </View>
            </View>

            <View className="mt-5">
                <Text className="text-xs font-semibold text-gray-500 uppercase px-4 pb-1">Hỗ trợ & Pháp lý</Text>
                <View className="bg-white rounded-lg shadow-sm mx-2 overflow-hidden">
                    {supportOptions.map((item, index) => (<OptionItem key={index} {...item}
                        disabled={isUpdatingProfileImage || authIsLoading || isSubmittingContact} />))}
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
                        disabled={isUpdatingProfileImage || authIsLoading || isSubmittingContact}
                    />
                </View>
            </View>
        </ScrollView>

        <CustomerCareModal
            visible={customerCareModalVisible}
            onClose={() => setCustomerCareModalVisible(false)}
            onSubmit={handleSubmitCustomerCare}
            isLoading={isSubmittingContact}
        />
        <InfoModal
            visible={infoModalVisible}
            title={infoModalContent.title}
            content={infoModalContent.content}
            onClose={() => setInfoModalVisible(false)}
        />

    </SafeAreaView>);
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
    },
});

export default AccountScreen;
