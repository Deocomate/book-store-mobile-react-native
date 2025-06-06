// src/screens/auth/LoginScreen.jsx
import AuthButton from '@/components/auth/AuthButton';
import AuthInput from '@/components/auth/AuthInput';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError("Tên đăng nhập và mật khẩu không được để trống.");
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const response = await login(username, password);
            if (!response || !response.result?.authenticated) {
                setError(response?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
            }
        } catch (err) {
            setError(err?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
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

                    <AuthInput
                        label="Tên đăng nhập"
                        iconName="person-outline"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        editable={!isLoading}
                    />

                    <AuthInput
                        label="Mật khẩu"
                        iconName="lock-closed-outline"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChangeText={setPassword}
                        isPassword={true}
                        editable={!isLoading}
                    />

                    <AuthButton
                        title="Đăng Nhập"
                        onPress={handleLogin}
                        isLoading={isLoading}
                    />

                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} disabled={isLoading} className="my-2">
                        <Text className="text-sky-600 text-center text-sm font-medium">Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center mt-6">
                        <Text className="text-gray-600 text-sm">Chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')} disabled={isLoading}>
                            <Text className="text-sky-600 font-semibold text-sm">Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default LoginScreen;