// src/app/(app)/account/order-history/[id].js
import OrderDetailScreen from '@/screens/account/OrderDetailScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function OrderDetailRoute() {
    const { id } = useLocalSearchParams();
    return <OrderDetailScreen orderId={id} />;
}