import {Stack} from 'expo-router';
import React from 'react';
import HeaderRightIcon from "@/components/layouts/HeaderRightIcon";

export default function BlogStackLayoutRoute() {
    return (<Stack>
        <Stack.Screen name="index" options={{title: 'Tin tức & Bài viết', headerRight: () => <HeaderRightIcon/>,}}/>
        <Stack.Screen name="[id]" options={{title: 'Chi tiết bài viết', headerRight: () => <HeaderRightIcon/>,}}/>
    </Stack>);
} 