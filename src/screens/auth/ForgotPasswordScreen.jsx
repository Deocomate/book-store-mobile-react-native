// src/screens/auth/ForgotPasswordScreen.jsx
import AuthButton from '@/components/auth/AuthButton';
import AuthInput from '@/components/auth/AuthInput';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

function ForgotPasswordScreen() {
    const router = useRouter();
    const { sendOtpForgotPassword, verifyOtpAndGetResetToken } = useAuth();
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSendOtp = async () => {
        if (!username.trim()) return setError("Vui lòng nhập tên đăng nhập hoặc email.");
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const response = await sendOtpForgotPassword(username);
            if (response && response.status === 200) {
                setIsOtpSent(true);
                setSuccessMessage(response.result || "Mã OTP đã được gửi. Vui lòng kiểm tra email.");
            } else {
                setError(response?.message || "Không thể gửi OTP. Vui lòng thử lại.");
            }
        } catch (err) {
            setError(err?.message || "Đã xảy ra lỗi khi gửi OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim() || otp.length !== 6) return setError("Vui lòng nhập mã OTP hợp lệ (6 chữ số).");
        setError('');
        setSuccessMessage('');
        setIsVerifying(true);
        try {
            const response = await verifyOtpAndGetResetToken(username, otp);
            if (response?.result?.verificationToken) {
                Alert.alert("Xác thực thành công", "Mã OTP hợp lệ.");
                router.push({
                    pathname: '/(auth)/reset-password',
                    params: { username: username, verificationToken: response.result.verificationToken }
                });
            } else {
                setError(response?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
            }
        } catch (err) {
            setError(err?.message || "Đã xảy ra lỗi khi xác thực OTP.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (<SafeAreaView className="flex-1 bg-slate-50">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6" keyboardShouldPersistTaps="handled">
                <View className="items-center mb-8">
                    <MaterialCommunityIcons name="lock-question" size={80} color="#0EA5E9" />
                    <Text className="text-3xl font-bold text-sky-600 mt-4">
                        {isOtpSent ? "Nhập Mã Xác Thực" : "Quên Mật Khẩu"}
                    </Text>
                    <Text className="text-gray-600 mt-2 text-center px-4">
                        {isOtpSent ? `Một mã OTP đã được gửi đến email liên kết với tài khoản '${username}'.` : "Nhập tên đăng nhập hoặc email để nhận mã xác thực."}
                    </Text>
                </View>

                {error ? <View className="bg-red-100 p-3 rounded-md mb-4"><Text className="text-red-700 text-center">{error}</Text></View> : null}
                {successMessage ? <View className="bg-green-100 p-3 rounded-md mb-4"><Text className="text-green-700 text-center">{successMessage}</Text></View> : null}

                {!isOtpSent ? (<>
                    <AuthInput
                        label="Tên đăng nhập hoặc Email"
                        iconName="person-outline"
                        placeholder="Nhập tên đăng nhập hoặc email"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        editable={!isLoading}
                    />
                    <AuthButton title="Gửi Mã Xác Thực" onPress={handleSendOtp} isLoading={isLoading} />
                </>) : (<>
                    <AuthInput
                        label="Mã OTP"
                        iconName="keypad-outline"
                        placeholder="Nhập mã OTP (6 chữ số)"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isVerifying}
                    />
                    <AuthButton title="Xác Nhận" onPress={handleVerifyOtp} isLoading={isVerifying} disabled={otp.length !== 6} />
                    <TouchableOpacity onPress={handleSendOtp} disabled={isLoading} className="my-2">
                        <Text className="text-sky-600 text-center text-sm font-medium">
                            {isLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                        </Text>
                    </TouchableOpacity>
                </>)}
                <TouchableOpacity onPress={() => router.back()} disabled={isLoading} className="mt-6">
                    <Text className="text-gray-600 text-center text-sm">Quay lại Đăng nhập</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>);
}

export default ForgotPasswordScreen;