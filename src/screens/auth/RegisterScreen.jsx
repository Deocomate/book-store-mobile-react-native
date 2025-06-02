import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

function RegisterScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = () => {
        // Logic đăng ký sẽ được thêm ở đây
        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        console.log('Đăng ký với:', username, email, password);
        // Sau khi đăng ký thành công (giả lập):
        // router.replace('/(auth)/login');
    };

    const navigateToLogin = () => {
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
                    <View className="items-center mb-8">
                        <MaterialCommunityIcons name="account-plus-outline" size={80} color="#0EA5E9" />
                        <Text className="text-3xl font-bold text-sky-600 mt-4">Tạo Tài Khoản</Text>
                    </View>

                    {/* Username Input */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Tên đăng nhập</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3">
                            <Ionicons name="person-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập tên đăng nhập"
                                placeholderTextColor="#9CA3AF"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Email Input */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Email</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3">
                            <Ionicons name="mail-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập địa chỉ email"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Mật khẩu</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3">
                            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Xác nhận mật khẩu</Text>
                        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3">
                            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2" />
                            <TextInput
                                className="flex-1 text-base text-gray-800"
                                placeholder="Nhập lại mật khẩu"
                                placeholderTextColor="#9CA3AF"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleRegister}
                        className="bg-sky-500 py-4 rounded-lg shadow-md active:bg-sky-600 mb-6"
                    >
                        <Text className="text-white text-center text-lg font-semibold">Đăng Ký</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center">
                        <Text className="text-gray-600 text-sm">Đã có tài khoản? </Text>
                        <TouchableOpacity onPress={navigateToLogin}>
                            <Text className="text-sky-600 font-semibold text-sm">Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default RegisterScreen;