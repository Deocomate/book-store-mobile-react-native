import HeaderRightIcon from "@/components/layouts/HeaderRightIcon";
import { Stack } from 'expo-router';
import React from 'react';

export default function HomeStackLayoutRoute() {
    return (<Stack>
        <Stack.Screen name="index"
            options={{
                headerShown: true, title: 'Trang chủ', headerRight: () => (<HeaderRightIcon />)
            }}
        />
    </Stack>);
}