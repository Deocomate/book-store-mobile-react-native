import {Stack} from 'expo-router';
import React from 'react';
import HeaderRightIcon from "@/components/layouts/HeaderRightIcon";

export default function ProductStackLayoutRoute() {
    return (<Stack>
        <Stack.Screen name="index" options={{title: 'Tìm kiếm sách', headerRight: () => <HeaderRightIcon/>,}}/>
        <Stack.Screen name="[id]" options={{title: 'Chi tiết sách', headerRight: () => <HeaderRightIcon/>,}}/>
    </Stack>);
}