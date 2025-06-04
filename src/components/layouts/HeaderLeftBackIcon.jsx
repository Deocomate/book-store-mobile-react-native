import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export default function HeaderLeftBackIcon({ color = 'black', size = 26 }) {
    const router = useRouter();

    return (<TouchableOpacity
        onPress={() => {
            if (router.canGoBack()) {
                router.back();
            }
        }}
        accessibilityLabel="Thông báo"
        accessibilityRole="button"
    >
        <Ionicons name="arrow-back-outline" size={size} color={color} />
    </TouchableOpacity>);
}