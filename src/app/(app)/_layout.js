/* ===== app/(app)/_layout.js ===== */
import HeaderRightIcon from '@/components/layouts/HeaderRightIcon';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Ví dụ icon
import { Tabs } from 'expo-router';
import React from 'react';

export default function AppTabsLayoutRoute() {
    return (<Tabs
        screenOptions={{
            headerShown: true,
            headerRight: () => <HeaderRightIcon />,
        }}
    >
        <Tabs.Screen
            name="(home)"
            options={{
                headerShown: false,
                headerRight: () => <HeaderRightIcon />,
                title: 'Trang chủ',
                href: "/(app)/(home)",
                tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
            }}
        />
        <Tabs.Screen
            name="blog"
            options={{
                headerShown: false,
                title: 'Tin tức',
                href: "/(app)/blog",
                tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="post-outline" size={size}
                    color={color} />,
            }}
        />
        <Tabs.Screen
            name="product"
            options={{
                headerShown: false,
                title: 'Sản phẩm',
                href: "/(app)/product",
                tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
            }}
        />

        <Tabs.Screen
            name="cart"
            options={{
                headerShown: false,
                href: "/(app)/cart",
                title: ' Giỏ hàng',
                tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
            }}
        />
        <Tabs.Screen
            name="account"
            options={{
                title: 'Tài khoản',
                href: "/(app)/account",
                headerShown: false,
                tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle" size={size}
                    color={color} />,
            }}
        />

        {/* Các screen này không hiển thị trên tab bar, được điều hướng tới */}
        <Tabs.Screen
            name="notification"
            options={{
                title: 'Giỏ hàng', headerShown: false, href: null
            }}
        />
        <Tabs.Screen
            name="checkout"
            options={{
                title: 'Thanh toán', headerShown: false, href: null
            }}
        />
    </Tabs>);
}