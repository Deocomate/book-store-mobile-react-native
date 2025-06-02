// src/screens/auth/LoginScreen.jsx
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth(); // Lấy hàm login từ context
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // State cho loading
    const [error, setError] = useState(''); // State cho thông báo lỗi

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError("Tên đăng nhập và mật khẩu không được để trống.");
            return;
        }
        setError(''); // Xóa lỗi cũ
        setIsLoading(true);
        try {
            const response = await login(username, password);
            // AuthProvider sẽ tự động điều hướng nếu login thành công
            // response ở đây là ApiResponse từ backend (thông qua identityService và AuthProvider)
            console.log('Login response in screen:', response);
            if (response && response.status === 200 && response.result && response.result.authenticated) {
                // Đăng nhập thành công, AuthProvider sẽ xử lý điều hướng
                // Không cần router.replace ở đây nữa
            } else {
                // Xử lý trường hợp API trả về success nhưng không authenticated, hoặc message lỗi cụ thể
                setError(response?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
            }
        } catch (err) {
            // Lỗi đã được console.error trong service hoặc AuthProvider
            // err ở đây là lỗi đã được xử lý (ví dụ: data từ error.response)
            setError(err?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToForgotPassword = () => {
        router.push('/(auth)/forgot-password');
    };

    const navigateToRegister = () => {
        router.push('/(auth)/register');
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
                        <MaterialCommunityIcons name="book-open-page-variant-outline" size={80} color="#0EA5E9" />
                        <Text className="text-4xl font-bold text-sky-600 mt-4">BookStore</Text>
                        <Text className="text-2xl font-semibold text-gray-700 mt-2">Đăng Nhập</Text>
                    </View>

                    {error ? (
                        <View className="bg-red-100 border border-red-400 p-3 rounded-md mb-4">
                            <Text className="text-red-700 text-center">{error}</Text>
                        </View>
                    ) : null}

                    {/* Username Input */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Tên đăng nhập</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                            <Ionicons name="person-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập tên đăng nhập"
                                placeholderTextColor="#9CA3AF"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                keyboardType="default"
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Mật khẩu</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        className={`py-4 rounded-lg shadow-md mb-4 ${isLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-center text-lg font-semibold">Đăng Nhập</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={navigateToForgotPassword} disabled={isLoading} className="mb-6">
                        <Text className="text-sky-600 text-center text-sm font-medium">Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center">
                        <Text className="text-gray-600 text-sm">Chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={navigateToRegister} disabled={isLoading}>
                            <Text className="text-sky-600 font-semibold text-sm">Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default LoginScreen;
