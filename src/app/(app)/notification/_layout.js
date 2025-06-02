import {Stack} from 'expo-router';
import React from 'react';
import HeaderRightIcon from "@/components/layouts/HeaderRightIcon";
import HeaderLeftBackIcon from "@/components/layouts/HeaderLeftBackIcon";

export default function NotificationStackLayoutRoute() {
    return (<Stack>
        <Stack.Screen name="index" options={{title: 'Thông báo', headerLeft: () => <HeaderLeftBackIcon/>}}/>
    </Stack>);
}