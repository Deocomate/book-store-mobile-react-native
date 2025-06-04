// src/app/(app)/account/_layout.js
import HeaderLeftBackIcon from '@/components/layouts/HeaderLeftBackIcon';
import HeaderRightIcon from "@/components/layouts/HeaderRightIcon";
import { Stack } from 'expo-router';
import React from 'react';

export default function AccountStackLayoutRoute() {
    return (
        <Stack>
            <Stack.Screen
                name="index" // Tham chiếu đến src/app/(app)/account/index.jsx
                options={{
                    headerShown: true,
                    title: 'Tài Khoản Của Tôi',
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="edit-profile" // src/app/(app)/account/edit-profile.jsx
                options={{
                    headerShown: true,
                    title: 'Chỉnh Sửa Thông Tin',
                    headerLeft: () => <HeaderLeftBackIcon />,
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="order-history/index" // src/app/(app)/account/order-history/index.jsx
                options={{
                    headerShown: true,
                    title: 'Lịch Sử Đơn Hàng',
                    headerLeft: () => <HeaderLeftBackIcon />, // Có thể không cần nút back ở đây vì đây là màn hình chính của mục này
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="order-history/[id]" // src/app/(app)/account/order-history/[id].js
                options={{
                    headerShown: true,
                    title: 'Chi Tiết Đơn Hàng',
                    headerLeft: () => <HeaderLeftBackIcon />,
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="addresses" // src/app/(app)/account/addresses.jsx
                options={{
                    headerShown: true,
                    title: 'Địa Chỉ Giao Hàng',
                    headerLeft: () => <HeaderLeftBackIcon />,
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="change-password" // src/app/(app)/account/change-password.jsx
                options={{
                    headerShown: true,
                    title: 'Đổi Mật Khẩu',
                    headerLeft: () => <HeaderLeftBackIcon />,
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
        </Stack>
    );
}