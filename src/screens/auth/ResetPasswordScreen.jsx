
/* ===== (NEW FILE) src/screens/auth/ResetPasswordScreen.jsx ===== */
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

function ResetPasswordScreen() {
    const router = useRouter();
    const { resetPasswordWithVerificationToken } = useAuth();
    const params = useLocalSearchParams();
    const { username, verificationToken } = params; // Get token from navigation params

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleResetPassword = async () => {
        setError('');
        setSuccessMessage('');
        if (!newPassword || !confirmNewPassword) {
            setError("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }
        if (!verificationToken) {
            setError("Thiếu mã xác thực để đặt lại mật khẩu. Vui lòng thử lại quy trình quên mật khẩu.");
            // Optionally navigate back to forgot password or login after a delay
            setTimeout(() => router.replace('/(auth)/forgot-password'), 3000);
            return;
        }

        setIsLoading(true);
        try {
            const response = await resetPasswordWithVerificationToken(newPassword, verificationToken);
            // identityService.resetPasswordWithToken returns ApiResponse<string>
            // The result field contains the success message.
            if (response && response.status === 200) {
                setSuccessMessage(response.result || "Mật khẩu đã được đặt lại thành công!");
                Alert.alert(
                    "Thành công!",
                    response.result || "Mật khẩu của bạn đã được đặt lại. Vui lòng đăng nhập bằng mật khẩu mới.",
                    [{ text: "OK", onPress: () => router.replace('/(auth)/login') }]
                );
            } else {
                setError(response?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    className="px-6"
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="items-center mb-8">
                        <MaterialCommunityIcons name="lock-reset" size={80} color="#0EA5E9" />
                        <Text className="text-3xl font-bold text-sky-600 mt-4">Đặt Lại Mật Khẩu</Text>
                        {username && (
                            <Text className="text-gray-600 mt-2 text-center">
                                Đặt lại mật khẩu cho tài khoản: <Text className="font-semibold">{username}</Text>
                            </Text>
                        )}
                    </View>

                    {error ? (
                        <View className="bg-red-100 border border-red-400 p-3 rounded-md mb-4">
                            <Text className="text-red-700 text-center">{error}</Text>
                        </View>
                    ) : null}
                    {successMessage && !error ? (
                        <View className="bg-green-100 border border-green-400 p-3 rounded-md mb-4">
                            <Text className="text-green-700 text-center">{successMessage}</Text>
                        </View>
                    ) : null}

                    {/* New Password Input */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Mật khẩu mới</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3.5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                            <Ionicons name="key-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                placeholderTextColor="#9CA3AF"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} disabled={isLoading}>
                                <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm New Password Input */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Xác nhận mật khẩu mới</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3.5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                            <Ionicons name="key-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập lại mật khẩu mới"
                                placeholderTextColor="#9CA3AF"
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry={!showConfirmNewPassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)} disabled={isLoading}>
                                <Ionicons name={showConfirmNewPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleResetPassword}
                        disabled={isLoading}
                        className={`py-4 rounded-lg shadow-md mb-6 ${isLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-center text-lg font-semibold">Đặt Lại Mật Khẩu</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')} disabled={isLoading} className="mt-2">
                        <Text className="text-gray-600 text-center text-sm">Quay lại Đăng nhập</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default ResetPasswordScreen;