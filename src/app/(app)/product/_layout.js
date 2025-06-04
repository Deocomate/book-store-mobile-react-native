// src/app/(app)/product/_layout.js
import HeaderLeftBackIcon from '@/components/layouts/HeaderLeftBackIcon'; // Thêm import này
import { Stack } from 'expo-router';
import React from 'react';
import HeaderRightIcon from "@/components/layouts/HeaderRightIcon";

export default function ProductStackLayoutRoute() {
    return (<Stack>
        <Stack.Screen name="index" options={{ title: 'Tìm kiếm sách', headerRight: () => <HeaderRightIcon />, }} />
        <Stack.Screen
            name="[id]"
            options={{
                title: 'Chi tiết sách',
                headerRight: () => <HeaderRightIcon />,
                headerLeft: () => <HeaderLeftBackIcon />, // Thêm nút back cho màn hình chi tiết sản phẩm
            }}
        />
        <Stack.Screen // Route mới cho màn hình đánh giá sản phẩm
            name="reviews"
            options={{
                title: 'Đánh giá sản phẩm',
                headerRight: () => <HeaderRightIcon />,
                headerLeft: () => <HeaderLeftBackIcon />,
            }}
        />
    </Stack>);
}