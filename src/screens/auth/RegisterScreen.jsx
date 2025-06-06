// src/screens/auth/RegisterScreen.jsx
import AuthButton from '@/components/auth/AuthButton';
import AuthInput from '@/components/auth/AuthInput';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

function RegisterScreen() {
    const router = useRouter();
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            return setError("Vui lòng điền đầy đủ thông tin.");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return setError("Địa chỉ email không hợp lệ.");
        }
        if (password.length < 6) {
            return setError("Mật khẩu phải có ít nhất 6 ký tự.");
        }
        if (password !== confirmPassword) {
            return setError("Mật khẩu xác nhận không khớp.");
        }

        setIsLoading(true);
        try {
            const response = await register({ username, email, password });
            if (response && response.status === 201) {
                Alert.alert("Đăng ký thành công!", response.message || "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.", [{
                    text: "OK", onPress: () => router.replace('/(auth)/login')
                }]);
            } else {
                if (response?.error?.[0]) {
                    setError(`${response.error[0].field}: ${response.error[0].message}`);
                } else {
                    setError(response?.message || "Đăng ký không thành công. Vui lòng thử lại.");
                }
            }
        } catch (err) {
            if (err?.error?.[0]) {
                setError(`Lỗi trường ${err.error[0].field}: ${err.error[0].message}`);
            } else {
                setError(err?.message || "Đã có lỗi xảy ra trong quá trình đăng ký.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (<SafeAreaView className="flex-1 bg-slate-50">
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

                {error ? (<View className="bg-red-100 border border-red-400 p-3 rounded-md mb-4">
                    <Text className="text-red-700 text-center">{error}</Text>
                </View>) : null}

                <AuthInput
                    label="Tên đăng nhập"
                    iconName="person-outline"
                    placeholder="Nhập tên đăng nhập (chữ thường, số)"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                <AuthInput
                    label="Email"
                    iconName="mail-outline"
                    placeholder="Nhập địa chỉ email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                <AuthInput
                    label="Mật khẩu"
                    iconName="lock-closed-outline"
                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                    value={password}
                    onChangeText={setPassword}
                    isPassword={true}
                    editable={!isLoading}
                />
                <AuthInput
                    label="Xác nhận mật khẩu"
                    iconName="lock-closed-outline"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    isPassword={true}
                    editable={!isLoading}
                />

                <AuthButton title="Đăng Ký" onPress={handleRegister} isLoading={isLoading} />

                <View className="flex-row justify-center items-center mt-6">
                    <Text className="text-gray-600 text-sm">Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')} disabled={isLoading}>
                        <Text className="text-sky-600 font-semibold text-sm">Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>);
}

export default RegisterScreen;