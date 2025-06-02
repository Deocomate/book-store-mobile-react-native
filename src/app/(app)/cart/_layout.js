import {Stack} from 'expo-router';
import React from 'react';
import HeaderRightIcon from "@/components/layouts/HeaderRightIcon";

export default function CartStackLayoutRoute() {
    return (<Stack>
        <Stack.Screen name="index" options={{title: 'Giỏ hàng của bạn', headerRight: () => <HeaderRightIcon/>,}}/>
    </Stack>);
} 