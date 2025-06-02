import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';

export default function HeaderLeftBackIcon({color = 'black', size = 26}) {
    const router = useRouter();

    return (<TouchableOpacity
        onPress={() => router.back()}
        accessibilityLabel="Thông báo"
        accessibilityRole="button"
    >
        <Ionicons name="arrow-back-outline" size={size} color={color}/>
    </TouchableOpacity>);
}