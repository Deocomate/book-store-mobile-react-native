// src/components/auth/AuthInput.jsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

const AuthInput = ({ label, iconName, isPassword, ...props }) => {
    const [isSecure, setIsSecure] = useState(isPassword);

    return (
        <View className="mb-5">
            <Text className="text-sm font-medium text-gray-600 mb-1 ml-1">{label}</Text>
            <View
                className="flex-row items-center bg-white border border-gray-300 rounded-lg p-3.5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
                <Ionicons name={iconName} size={20} color="#6B7280" className="mr-3" />
                <TextInput
                    className="flex-1 text-base text-gray-800"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={isSecure}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
                        <Ionicons name={isSecure ? "eye-off-outline" : "eye-outline"} size={24} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default AuthInput;