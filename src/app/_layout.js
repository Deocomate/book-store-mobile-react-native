import AppProviders from '@/contexts';
import { Slot } from 'expo-router';
import React from 'react';
import "../global.css";

export default function RootLayoutRoute() {
    return (<AppProviders>
        <Slot />
    </AppProviders>);
}