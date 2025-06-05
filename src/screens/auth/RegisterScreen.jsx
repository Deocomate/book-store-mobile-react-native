import {useAuth} from '@/contexts/AuthContext';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

function RegisterScreen() {
    const router = useRouter();
    const {register} = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidEmail = (emailToTest) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailToTest);
    };

    const handleRegister = async () => {
        setError('');
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        if (!isValidEmail(email)) {
            setError("Địa chỉ email không hợp lệ.");
            return;
        }
        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsLoading(true);
        try {
            const userData = {username, email, password};
            const response = await register(userData);

            console.log(response)

            if (response && response.status === 201) {
                Alert.alert("Đăng ký thành công!", response.message || "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.", [{
                    text: "OK", onPress: () => router.replace('/(auth)/login')
                }]);
            } else {
                // Ưu tiên hiển thị lỗi chi tiết từ backend nếu có
                if (response && response.error && Array.isArray(response.error) && response.error.length > 0) {
                    const firstError = response.error[0];
                    setError(`${firstError.field}: ${firstError.message}`);
                } else {
                    setError(response?.message || "Đăng ký không thành công. Vui lòng thử lại.");
                }
            }
        } catch (err) {
            // Xử lý lỗi chi tiết từ err.error nếu có
            if (err && err.error && Array.isArray(err.error) && err.error.length > 0) {
                const firstError = err.error[0];
                // Hiển thị lỗi cụ thể hơn, ví dụ: "username: Username chỉ được chứa chữ cái thường..."
                setError(`Lỗi trường ${firstError.field}: ${firstError.message}`);
            } else {
                setError(err?.message || "Đã có lỗi xảy ra trong quá trình đăng ký.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToLogin = () => {
        if (!isLoading) {
            router.replace('/(auth)/login');
        }
    };

    return (<SafeAreaView className="flex-1 bg-slate-50">
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <ScrollView
                contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                className="px-6"
                keyboardShouldPersistTaps="handled"
            >
                <View className="items-center mb-8">
                    <MaterialCommunityIcons name="account-plus-outline" size={80} color="#0EA5E9"/>
                    <Text className="text-3xl font-bold text-sky-600 mt-4">Tạo Tài Khoản</Text>
                </View>

                {error ? (<View className="bg-red-100 border border-red-400 p-3 rounded-md mb-4">
                    <Text className="text-red-700 text-center">{error}</Text>
                </View>) : null}

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Tên đăng nhập</Text>
                    <View
                        className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                        <Ionicons name="person-outline" size={20} color="#6B7280" className="mr-2"/>
                        <TextInput
                            className="flex-1 text-base text-gray-800"
                            placeholder="Nhập tên đăng nhập (chữ thường, số)"
                            placeholderTextColor="#9CA3AF"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Email</Text>
                    <View
                        className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                        <Ionicons name="mail-outline" size={20} color="#6B7280" className="mr-2"/>
                        <TextInput
                            className="flex-1 text-base text-gray-800"
                            placeholder="Nhập địa chỉ email"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Mật khẩu</Text>
                    <View
                        className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2"/>
                        <TextInput
                            className="flex-1 text-base text-gray-800"
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            editable={!isLoading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24}
                                      color="#6B7280"/>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">Xác nhận mật khẩu</Text>
                    <View
                        className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2"/>
                        <TextInput
                            className="flex-1 text-base text-gray-800"
                            placeholder="Nhập lại mật khẩu"
                            placeholderTextColor="#9CA3AF"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            editable={!isLoading}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                          disabled={isLoading}>
                            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24}
                                      color="#6B7280"/>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={isLoading}
                    className={`py-4 rounded-lg shadow-md mb-6 ${isLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                >
                    {isLoading ? (<ActivityIndicator color="#FFFFFF"/>) : (
                        <Text className="text-white text-center text-lg font-semibold">Đăng Ký</Text>)}
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                    <Text className="text-gray-600 text-sm">Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
                        <Text className="text-sky-600 font-semibold text-sm">Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>);
}

export default RegisterScreen;
