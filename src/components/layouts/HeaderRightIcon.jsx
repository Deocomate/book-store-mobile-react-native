import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';

export default function HeaderRightIcon({color = 'black', size = 26}) {
    const router = useRouter();

    return (<TouchableOpacity
        onPress={() => router.push('/(app)/notification')}
        className="p-2"
        accessibilityLabel="Thông báo"
        accessibilityRole="button"
    >
        <Ionicons name="notifications-outline" size={size} color={color}/>
    </TouchableOpacity>);
}