/* ===== (NEW FILE) src/screens/auth/ForgotPasswordScreen.jsx ===== */
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

function ForgotPasswordScreen() {
    const router = useRouter();
    const { sendOtpForgotPassword, verifyOtpAndGetResetToken } = useAuth();
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSendOtp = async () => {
        setError('');
        setSuccessMessage('');
        if (!username.trim()) {
            setError("Vui lòng nhập tên đăng nhập hoặc email.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await sendOtpForgotPassword(username);
            // identityService.sendOtpForgotPassword returns ApiResponse<string>
            // The result field in ApiResponse<string> contains the success message.
            if (response && response.status === 200) {
                setIsOtpSent(true);
                setSuccessMessage(response.result || "Mã OTP đã được gửi thành công. Vui lòng kiểm tra email của bạn.");
                Alert.alert("Thành công", response.result || "Mã OTP đã được gửi. Vui lòng kiểm tra email.");
            } else {
                setError(response?.message || "Không thể gửi OTP. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error('Send OTP error:', err);
            setError(err?.message || "Đã xảy ra lỗi khi gửi OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError('');
        setSuccessMessage('');
        if (!otp.trim() || otp.length !== 6) { // Assuming OTP is 6 digits
            setError("Vui lòng nhập mã OTP hợp lệ (6 chữ số).");
            return;
        }
        setIsLoading(true);
        try {
            const response = await verifyOtpAndGetResetToken(username, otp);
            // identityService.verifyOtpForgotPassword returns ApiResponse<VerifyOtpResponse>
            // VerifyOtpResponse { boolean valid; String verificationToken; }
            if (response && response.status === 200 && response.result && response.result.valid) {
                Alert.alert("Xác thực thành công", "Mã OTP hợp lệ.");
                router.push({
                    pathname: '/(auth)/reset-password',
                    params: { username: username, verificationToken: response.result.verificationToken }
                });
            } else {
                setError(response?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            setError(err?.message || "Đã xảy ra lỗi khi xác thực OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP is essentially the same as send OTP again
    const handleResendOtp = async () => {
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const response = await sendOtpForgotPassword(username);
            if (response && response.status === 200) {
                setSuccessMessage(response.result || "Mã OTP mới đã được gửi. Vui lòng kiểm tra email.");
                Alert.alert("Thành công", response.result || "Mã OTP mới đã được gửi.");
            } else {
                setError(response?.message || "Không thể gửi lại OTP. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            setError(err?.message || "Đã xảy ra lỗi khi gửi lại OTP.");
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
                        <MaterialCommunityIcons name="lock-question" size={80} color="#0EA5E9" />
                        <Text className="text-3xl font-bold text-sky-600 mt-4">
                            {isOtpSent ? "Nhập Mã Xác Thực" : "Quên Mật Khẩu"}
                        </Text>
                        <Text className="text-gray-600 mt-2 text-center px-4">
                            {isOtpSent
                                ? `Một mã OTP đã được gửi đến email liên kết với tài khoản '${username}'.`
                                : "Nhập tên đăng nhập hoặc email của bạn để nhận mã xác thực."}
                        </Text>
                    </View>

                    {error ? (
                        <View className="bg-red-100 border border-red-400 p-3 rounded-md mb-4">
                            <Text className="text-red-700 text-center">{error}</Text>
                        </View>
                    ) : null}
                    {successMessage && !error ? ( // Only show success if no error
                        <View className="bg-green-100 border border-green-400 p-3 rounded-md mb-4">
                            <Text className="text-green-700 text-center">{successMessage}</Text>
                        </View>
                    ) : null}


                    {!isOtpSent ? (
                        <>
                            <View className="mb-5">
                                <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Tên đăng nhập hoặc Email</Text>
                                <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                                    <Ionicons name="person-outline" size={20} color="#6B7280" className="mr-2" />
                                    <TextInput
                                        className="flex-1 text-base text-gray-800"
                                        placeholder="Nhập tên đăng nhập hoặc email"
                                        placeholderTextColor="#9CA3AF"
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="none"
                                        editable={!isLoading}
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
                            <View className="mb-5">
                                <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Mã OTP</Text>
                                <View className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                                    <MaterialCommunityIcons name="numeric" size={20} color="#6B7280" className="mr-2" />
                                    <TextInput
                                        className="flex-1 text-base text-gray-800"
                                        placeholder="Nhập mã OTP (6 chữ số)"
                                        placeholderTextColor="#9CA3AF"
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleVerifyOtp}
                                disabled={isLoading || otp.length !== 6}
                                className={`py-4 rounded-lg shadow-md mb-4 ${(isLoading || otp.length !== 6) ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                            >
                                {isLoading && otp.length === 6 ? ( // Show loader only when trying to verify valid length OTP
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

                    <TouchableOpacity onPress={() => router.back()} disabled={isLoading} className="mt-4">
                        <Text className="text-gray-600 text-center text-sm">Quay lại Đăng nhập</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default ForgotPasswordScreen;