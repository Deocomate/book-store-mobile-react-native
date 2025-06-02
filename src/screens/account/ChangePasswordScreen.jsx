/* ===== src/screens/account/ChangePasswordScreen.jsx ===== */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext'; // Assuming updateMyPassword is in AuthContext
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

function ChangePasswordScreen() {
    const { updateMyPassword, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChangePassword = async () => {
        if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các trường mật khẩu.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }
        if (newPassword.length < 6) { // Example: Minimum password length
            Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        setIsSubmitting(true);
        try {
            // updateMyPassword from AuthContext should handle calling identityService.updateMyPassword
            const response = await updateMyPassword(oldPassword, newPassword);

            if (response && response.status === 200) { // Check based on your API's success response
                Alert.alert("Thành công", "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại nếu được yêu cầu.");
                // Optionally logout user or navigate them
                // router.back(); // Go back to account screen
                // Or, if API requires re-login after password change:
                // await logout(); 
                // router.replace('/(auth)/login');
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                Alert.alert("Lỗi", response?.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.");
            }
        } catch (error) {
            console.error("Change password error:", error);
            Alert.alert("Lỗi", error?.message || "Đã xảy ra lỗi khi đổi mật khẩu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading && !isSubmitting) { // Show general auth loading if not specifically submitting form
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0EA5E9" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="p-5 space-y-5">
                    <Text className="text-xl font-semibold text-gray-700 mb-2">Thay đổi mật khẩu</Text>

                    {/* Old Password */}
                    <View>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Mật khẩu cũ</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3.5 focus-within:border-sky-500">
                            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập mật khẩu cũ"
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                secureTextEntry={!showOldPassword}
                                editable={!isSubmitting}
                            />
                            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                                <Ionicons name={showOldPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password */}
                    <View>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Mật khẩu mới</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3.5 focus-within:border-sky-500">
                            <Ionicons name="key-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                editable={!isSubmitting}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm New Password */}
                    <View>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Xác nhận mật khẩu mới</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3.5 focus-within:border-sky-500">
                            <Ionicons name="key-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry={!showConfirmNewPassword}
                                editable={!isSubmitting}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                                <Ionicons name={showConfirmNewPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleChangePassword}
                        disabled={isSubmitting || authLoading}
                        className={`py-4 rounded-lg shadow-md mt-5 ${isSubmitting || authLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-center text-lg font-semibold">Lưu Mật Khẩu</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default ChangePasswordScreen;