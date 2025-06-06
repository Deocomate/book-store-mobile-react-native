// src/screens/auth/ResetPasswordScreen.jsx
import AuthButton from '@/components/auth/AuthButton';
import AuthInput from '@/components/auth/AuthInput';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

function ResetPasswordScreen() {
    const router = useRouter();
    const { resetPasswordWithVerificationToken } = useAuth();
    const { username, verificationToken } = useLocalSearchParams();

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        if (!newPassword || !confirmNewPassword) return setError("Vui lòng nhập đầy đủ mật khẩu.");
        if (newPassword.length < 6) return setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
        if (newPassword !== confirmNewPassword) return setError("Mật khẩu mới và xác nhận không khớp.");
        if (!verificationToken) {
            setError("Thiếu mã xác thực. Vui lòng quay lại.");
            return;
        }

        setError('');
        setIsLoading(true);
        try {
            const response = await resetPasswordWithVerificationToken(newPassword, verificationToken);
            if (response && response.status === 200) {
                Alert.alert("Thành công!", response.result || "Mật khẩu của bạn đã được đặt lại. Vui lòng đăng nhập.", [{
                    text: "OK",
                    onPress: () => router.replace('/(auth)/login')
                }]);
            } else {
                setError(response?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
            }
        } catch (err) {
            setError(err?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (<SafeAreaView className="flex-1 bg-slate-50">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6" keyboardShouldPersistTaps="handled">
                <View className="items-center mb-8">
                    <MaterialCommunityIcons name="lock-reset" size={80} color="#0EA5E9" />
                    <Text className="text-3xl font-bold text-sky-600 mt-4">Đặt Lại Mật Khẩu</Text>
                    {username && (
                        <Text className="text-gray-600 mt-2 text-center">
                            Tài khoản: <Text className="font-semibold">{username}</Text>
                        </Text>
                    )}
                </View>

                {error ? <View className="bg-red-100 p-3 rounded-md mb-4"><Text className="text-red-700 text-center">{error}</Text></View> : null}

                <AuthInput
                    label="Mật khẩu mới"
                    iconName="key-outline"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    isPassword={true}
                    editable={!isLoading}
                />

                <AuthInput
                    label="Xác nhận mật khẩu mới"
                    iconName="key-outline"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    isPassword={true}
                    editable={!isLoading}
                />

                <AuthButton title="Đặt Lại Mật Khẩu" onPress={handleResetPassword} isLoading={isLoading} />

                <TouchableOpacity onPress={() => router.replace('/(auth)/login')} disabled={isLoading} className="mt-6">
                    <Text className="text-gray-600 text-center text-sm">Quay lại Đăng nhập</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>);
}

export default ResetPasswordScreen;