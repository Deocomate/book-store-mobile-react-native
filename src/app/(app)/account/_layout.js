/* ===== src/app/(app)/account/_layout.js ===== */
import HeaderLeftBackIcon from '@/components/layouts/HeaderLeftBackIcon'; // Assuming you want a back button for sub-screens
import HeaderRightIcon from "@/components/layouts/HeaderRightIcon";
import { Stack } from 'expo-router';
import React from 'react';

export default function AccountStackLayoutRoute() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: 'Tài Khoản Của Tôi', // Updated title
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="edit-profile"
                options={{
                    headerShown: true,
                    title: 'Chỉnh Sửa Thông Tin',
                    headerLeft: () => <HeaderLeftBackIcon />, // Add back button
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="order-history"
                options={{
                    headerShown: true,
                    title: 'Lịch Sử Đơn Hàng',
                    headerLeft: () => <HeaderLeftBackIcon />,
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="addresses"
                options={{
                    headerShown: true,
                    title: 'Địa Chỉ Giao Hàng',
                    headerLeft: () => <HeaderLeftBackIcon />,
                    headerRight: () => <HeaderRightIcon />,
                }}
            />
            <Stack.Screen
                name="change-password"
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
