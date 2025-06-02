import {Stack} from 'expo-router';
import React from 'react';

export default function CheckoutStackLayoutRoute() {
    return (<Stack>
            <Stack.Screen name="index" options={{title: 'Thanh toán'}}/>
        </Stack>);
} 