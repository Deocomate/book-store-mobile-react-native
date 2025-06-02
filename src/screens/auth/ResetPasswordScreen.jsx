import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

function ResetPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams(); // Để lấy username nếu cần hiển thị
    const { username } = params;

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!newPassword || !confirmNewPassword) {
            alert("Vui lòng nhập đầy đủ thông tin.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }
        // Giả sử độ dài mật khẩu tối thiểu là 6
        if (newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        setIsLoading(true);
        // Giả lập API đổi mật khẩu
        console.log('Đổi mật khẩu cho', username, 'mật khẩu mới:', newPassword);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        setIsLoading(false);

        // Sau khi đổi mật khẩu thành công
        alert("Đổi mật khẩu thành công!");
        router.replace('/(auth)/login');
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
                    <View className="items-center mb-10">
                        <MaterialCommunityIcons name="lock-reset" size={80} color="#0EA5E9" />
                        <Text className="text-3xl font-bold text-sky-600 mt-4">Đặt Lại Mật Khẩu</Text>
                        {username && (
                            <Text className="text-gray-600 mt-2 text-center">
                                Đặt lại mật khẩu cho tài khoản: <Text className="font-semibold">{username}</Text>
                            </Text>
                        )}
                    </View>

                    {/* New Password Input */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Mật khẩu mới</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3">
                            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập mật khẩu mới"
                                placeholderTextColor="#9CA3AF"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm New Password Input */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Xác nhận mật khẩu mới</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3">
                            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập lại mật khẩu mới"
                                placeholderTextColor="#9CA3AF"
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry={!showConfirmNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
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
                            <Text className="text-white text-center text-lg font-semibold">Đổi Mật Khẩu</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default ResetPasswordScreen;