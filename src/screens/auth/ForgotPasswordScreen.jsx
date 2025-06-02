import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

function ForgotPasswordScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // For simulated API calls

    const handleSendOtp = async () => {
        if (!username) {
            alert("Vui lòng nhập tên đăng nhập.");
            return;
        }
        setIsLoading(true);
        // Giả lập gọi API gửi OTP
        console.log('Gửi OTP cho:', username);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        setIsLoading(false);
        setIsOtpSent(true);
        // Trong thực tế, bạn sẽ gọi API ở đây
        // Nếu thành công thì setIsOtpSent(true)
        // Nếu thất bại, hiển thị lỗi
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            alert("Vui lòng nhập mã OTP.");
            return;
        }
        setIsLoading(true);
        // Giả lập xác thực OTP
        console.log('Xác thực OTP:', otp);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        setIsLoading(false);
        // Trong thực tế, nếu OTP đúng:
        router.push({ pathname: '/(auth)/reset-password', params: { username } }); // Truyền username để ResetPasswordScreen biết
        // Nếu OTP sai, hiển thị lỗi
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        console.log('Gửi lại OTP cho:', username);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        alert("Mã OTP mới đã được gửi (giả lập).");
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
                        <MaterialCommunityIcons name="lock-question" size={80} color="#0EA5E9" />
                        <Text className="text-3xl font-bold text-sky-600 mt-4">
                            {isOtpSent ? "Nhập Mã Xác Thực" : "Quên Mật Khẩu"}
                        </Text>
                        <Text className="text-gray-600 mt-2 text-center px-4">
                            {isOtpSent
                                ? `Một mã OTP đã được gửi đến email liên kết với tài khoản '${username}'.`
                                : "Nhập tên đăng nhập của bạn để nhận mã xác thực."}
                        </Text>
                    </View>

                    {!isOtpSent ? (
                        <>
                            {/* Username Input */}
                            <View className="mb-5">
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

                            <TouchableOpacity
                                onPress={handleSendOtp}
                                disabled={isLoading}
                                className={`py-4 rounded-lg shadow-md mb-6 ${isLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white text-center text-lg font-semibold">Gửi Mã Xác Thực</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* OTP Input */}
                            <View className="mb-5">
                                <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Mã OTP</Text>
                                <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3">
                                    <MaterialCommunityIcons name="numeric" size={20} color="#6B7280" className="mr-2" />
                                    <TextInput
                                        className="flex-1 text-base text-gray-800"
                                        placeholder="Nhập mã OTP"
                                        placeholderTextColor="#9CA3AF"
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleVerifyOtp}
                                disabled={isLoading}
                                className={`py-4 rounded-lg shadow-md mb-4 ${isLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white text-center text-lg font-semibold">Xác Nhận</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleResendOtp} disabled={isLoading} className="mb-6">
                                <Text className="text-sky-600 text-center text-sm font-medium">
                                    {isLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity onPress={() => router.back()} className="mt-4">
                        <Text className="text-gray-600 text-center text-sm">Quay lại Đăng nhập</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default ForgotPasswordScreen;