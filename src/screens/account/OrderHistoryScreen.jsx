// src/screens/account/OrderHistoryScreen.jsx
import { orderService } from '@/services';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

const OrderStatusMapping = {
    0: { text: 'Đã giao hàng', color: 'text-green-600', bg: 'bg-green-100' }, // Giao hàng thành công
    1: { text: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-100' },
    2: { text: 'Chờ vận chuyển', color: 'text-blue-600', bg: 'bg-blue-100' }, // Chờ đơn vị vận chuyển
    3: { text: 'Đang vận chuyển', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    4: { text: 'Đã giao', color: 'text-green-600', bg: 'bg-green-100' }, // Giống 0, có thể cần làm rõ hơn
    5: { text: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-100' },
    default: { text: 'Không xác định', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const PaymentMethodMapping = {
    0: 'Thanh toán khi nhận hàng (COD)',
    1: 'Thanh toán qua VNPay',
    2: 'Thanh toán qua MoMo',
    default: 'Phương thức khác'
};

// PaymentStatus không trực tiếp hiển thị trong list item, nhưng có thể dùng trong OrderDetail
// const PaymentStatusMapping = {
//     0: { text: 'Đã thanh toán', color: 'text-green-600' },
//     1: { text: 'Chưa thanh toán', color: 'text-red-600' },
//     2: { text: 'Đã hoàn tiền', color: 'text-blue-600' },
//     3: { text: 'Thanh toán thất bại', color: 'text-orange-600' },
//     5: { text: 'Đã huỷ thanh toán', color: 'text-gray-500' },
//     default: { text: 'Không xác định', color: 'text-gray-500' },
// };


const InfoRow = ({ icon, label, value, isCurrency = false }) => (
    <View className="flex-row items-center mt-1">
        <Ionicons name={icon} size={14} color="#6B7280" />
        <Text className="text-sm text-gray-600 ml-1.5 w-24">{label}</Text>
        <Text className={`text-sm ${isCurrency ? 'font-semibold text-sky-700' : 'text-gray-800'}`}>{value}</Text>
    </View>
);

function OrderHistoryScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const fetchOrders = useCallback(async (page = 1, refreshing = false) => {
        if (!refreshing && page > 1 && page > totalPages) return;
        if (refreshing || page === 1) setIsLoading(true);

        try {
            // API GET /order/my-orders?pageIndex={pageIndex}&pageSize={pageSize}
            const response = await orderService.getMyOrders(page, pageSize);
            // Backend OrderService.getOrdersByUserId trả về ApiResponse<PageResponse<OrderResponse>>
            // PageResponse: { currentPage, totalPages, totalElements, pageSize, data: List<OrderResponse> }
            // OrderResponse: { id, userId, profileId, fullName, phone, address, status, paymentMethod, paymentStatus, totalPrice, note, createdAt, orderProducts: Set<OrderProductResponse> }
            if (response && response.status === 200 && response.result) {
                const newOrders = response.result.data || [];
                setOrders(prevOrders => (page === 1 ? newOrders : [...prevOrders, ...newOrders]));
                setTotalPages(response.result.totalPages || 1);
                setPageIndex(page); // Cập nhật pageIndex hiện tại
            } else {
                Alert.alert("Lỗi", response?.message || "Không thể tải lịch sử đơn hàng.");
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
            Alert.alert("Lỗi", error?.message || "Đã có lỗi xảy ra khi tải đơn hàng.");
        } finally {
            setIsLoading(false);
            if (refreshing) setIsRefreshing(false);
        }
    }, [totalPages]); // Thêm totalPages vào dependencies

    useEffect(() => {
        // console.log("OrderHistoryScreen mounted or fetchOrders changed");
        fetchOrders(1, true);
    }, [fetchOrders]);

    const onRefresh = () => {
        // console.log("Refreshing orders...");
        setIsRefreshing(true);
        setPageIndex(1); // Reset page index khi refresh
        fetchOrders(1, true);
    };

    const loadMoreOrders = () => {
        // console.log(`Attempting to load more: isLoading=${isLoading}, isRefreshing=${isRefreshing}, pageIndex=${pageIndex}, totalPages=${totalPages}`);
        if (!isLoading && !isRefreshing && pageIndex < totalPages) {
            // console.log(`Loading page ${pageIndex + 1}`);
            fetchOrders(pageIndex + 1);
        }
    };

    const handleOrderItemPress = (orderId) => {
        router.push(`/account/order-history/${orderId}`);
    };

    const renderOrderItem = ({ item }) => {
        const statusInfo = OrderStatusMapping[item.status] || OrderStatusMapping.default;
        const paymentMethodText = PaymentMethodMapping[item.paymentMethod] || PaymentMethodMapping.default;
        const createdAtDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }) : 'N/A';

        return (
            <TouchableOpacity
                className="bg-white p-4 mb-3 mx-3 rounded-lg shadow-md active:bg-gray-50"
                onPress={() => handleOrderItemPress(item.id)}
            >
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-base font-semibold text-gray-800">Đơn hàng #{item.id}</Text>
                    <View className={`px-2 py-0.5 rounded-full ${statusInfo.bg}`}>
                        <Text className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.text}</Text>
                    </View>
                </View>
                <InfoRow icon="calendar-outline" label="Ngày đặt:" value={createdAtDate} />
                <InfoRow icon="person-outline" label="Người nhận:" value={item.fullName} />
                <InfoRow icon="pricetags-outline" label="Tổng tiền:" value={`${item.totalPrice?.toLocaleString('vi-VN')}₫`} isCurrency />
                <InfoRow icon="card-outline" label="Thanh toán:" value={paymentMethodText} />
                {item.orderProducts && item.orderProducts.length > 0 && (
                    <Text className="text-xs text-gray-500 mt-1.5">
                        {item.orderProducts.length} sản phẩm: {item.orderProducts.map(p => p.productName).slice(0, 2).join(', ')}{item.orderProducts.length > 2 ? '...' : ''}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    if (isLoading && pageIndex === 1 && !isRefreshing) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0EA5E9" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            {orders.length === 0 && !isLoading ? (
                <View className="flex-1 justify-center items-center p-5">
                    <MaterialCommunityIcons name="history" size={70} color="#CBD5E1" />
                    <Text className="text-xl font-semibold text-gray-500 mt-4">Chưa có đơn hàng nào</Text>
                    <Text className="text-gray-400 mt-1 text-center">
                        Tất cả các đơn hàng của bạn sẽ được hiển thị ở đây.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(app)/(home)/')}
                        className="mt-6 bg-sky-500 px-6 py-3 rounded-lg shadow-md active:bg-sky-600"
                    >
                        <Text className="text-white font-semibold text-base">Bắt đầu mua sắm</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
                    onEndReached={loadMoreOrders}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isLoading && pageIndex > 1 && pageIndex < totalPages ? <ActivityIndicator size="small" color="#0EA5E9" style={{ marginVertical: 20 }} /> : null}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#0EA5E9"]} tintColor={"#0EA5E9"} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

export default OrderHistoryScreen;