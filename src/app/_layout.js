import AppProviders from '@/contexts';
import { Slot, SplashScreen } from 'expo-router';
import React from 'react';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayoutRoute() {
    return (<AppProviders>
        <Slot />
    </AppProviders>);
} 