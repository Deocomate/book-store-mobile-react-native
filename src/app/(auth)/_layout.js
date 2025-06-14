import { Stack } from 'expo-router';
import React from 'react';

export default function AuthStackLayoutRoute() {
    return (<Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
    </Stack>);
} 