// src/components/auth/AuthButton.jsx
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

const AuthButton = ({ title, onPress, isLoading = false, disabled = false }) => {
    const isDisabled = isLoading || disabled;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            className={`py-4 rounded-lg shadow-md my-2 ${isDisabled ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
        >
            {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text className="text-white text-center text-lg font-semibold">{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default AuthButton;