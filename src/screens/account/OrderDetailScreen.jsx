// src/screens/account/OrderDetailScreen.jsx
import { orderService } from '@/services';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// Stack và useNavigation có thể không cần thiết nếu bạn đang dùng định tuyến file-based của Expo Router
// và màn hình này được trình bày như một Stack Screen.
// import { Stack, useNavigation } from 'expo-router';
import { useRouter } from 'expo-router'; // Sử dụng useRouter để điều hướng nếu cần
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const OrderStatusMapping = {
    0: { text: 'Đã giao hàng', color: 'text-green-600', bg: 'bg-green-100', icon: 'package-variant-closed-check' },
    1: { text: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-100', icon: 'timer-sand-outline' }, // Thay icon
    2: { text: 'Chờ vận chuyển', color: 'text-blue-600', bg: 'bg-blue-100', icon: 'package-variant' }, // Thay icon
    3: { text: 'Đang vận chuyển', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: 'truck-delivery-outline' },
    4: { text: 'Đã giao', color: 'text-green-600', bg: 'bg-green-100', icon: 'check-decagram-outline' }, // Icon khác cho "Đã giao" (nếu khác với "Giao thành công")
    5: { text: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-100', icon: 'cancel' },
    default: { text: 'Không xác định', color: 'text-gray-600', bg: 'bg-gray-100', icon: 'help-circle-outline' },
};

const PaymentMethodMapping = {
    0: { text: 'Thanh toán khi nhận hàng (COD)', icon: 'cash-multiple' }, // Icon khác
    1: { text: 'Thanh toán qua VNPay', icon: 'credit-card-outline' },
    2: { text: 'Thanh toán qua MoMo', icon: 'cellphone-marker' }, // Icon khác
    default: { text: 'Khác', icon: 'help-circle-outline' }
};

const PaymentStatusMapping = {
    0: { text: 'Đã thanh toán', color: 'text-green-600', icon: 'check-circle-outline' },
    1: { text: 'Chưa thanh toán', color: 'text-amber-600', icon: 'alert-circle-outline' }, // Icon và màu khác
    2: { text: 'Đã hoàn tiền', color: 'text-blue-600', icon: 'cash-refund' },
    3: { text: 'Thanh toán thất bại', color: 'text-red-500', icon: 'close-circle-outline' },
    // 5: { text: 'Đã huỷ thanh toán', color: 'text-gray-500', icon: 'cancel' }, // Trạng thái 5 của order là hủy đơn, payment status 5 có thể không tồn tại hoặc mang ý nghĩa khác.
    default: { text: 'Không xác định', color: 'text-gray-500', icon: 'help-circle-outline' },
};


const OrderProductItem = ({ item }) => (
    <View className="flex-row items-center bg-slate-50 p-3 my-1.5 rounded-md border border-slate-200">
        <View className="w-16 h-20 rounded mr-3 bg-gray-200 items-center justify-center">
            <MaterialCommunityIcons name="image-outline" size={30} color="gray" />
        </View>
        <View className="flex-1">
            <Text className="text-sm font-medium text-gray-800" numberOfLines={2}>{item.productName}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Số lượng: {item.quantity}</Text>
            <Text className="text-xs text-gray-500">Đơn giá: {item.price?.toLocaleString('vi-VN')}₫</Text>
        </View>
        <Text className="text-sm font-semibold text-sky-700">
            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
        </Text>
    </View>
);

const InfoRow = ({ icon, label, value, valueColor = 'text-gray-800', children }) => (
    <View className="flex-row items-start py-2 border-b border-slate-100">
        <MaterialCommunityIcons name={icon} size={20} color="#4B5563" className="mr-3 mt-0.5" />
        <Text className="w-2/5 text-sm text-gray-600">{label}:</Text>
        {value !== undefined && <Text className={`flex-1 text-sm font-medium ${valueColor}`}>{value || 'N/A'}</Text>}
        {children}
    </View>
);

function OrderDetailScreen({ orderId }) {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter(); // Sử dụng router nếu cần điều hướng sau khi hủy

    const fetchOrderDetail = useCallback(async () => {
        if (!orderId) {
            setError("ID đơn hàng không hợp lệ.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // API: GET /order/my-orders/{orderId}
            const response = await orderService.getMyOrderById(orderId);
            // Backend OrderService.getOrderByIdForUser trả về ApiResponse<OrderResponse>
            // OrderResponse: { id, userId, profileId, fullName, phone, address, status, paymentMethod, paymentStatus, totalPrice, note, createdAt, orderProducts: Set<OrderProductResponse> }
            if (response && response.status === 200 && response.result) {
                setOrder(response.result);
            } else {
                throw new Error(response?.message || "Không thể tải chi tiết đơn hàng.");
            }
        } catch (err) {
            console.error("Fetch order detail error:", err);
            setError(err.message || "Đã có lỗi xảy ra.");
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderDetail();
    }, [fetchOrderDetail]);

    const handleCancelOrder = async () => {
        if (!order) return;
        Alert.alert(
            "Xác nhận hủy đơn hàng",
            "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.",
            [
                { text: "Không", style: "cancel" },
                {
                    text: "Có, hủy đơn",
                    onPress: async () => {
                        setIsCancelling(true);
                        try {
                            // API: POST /order/{orderId}/cancer - Body: CancerOrderRequest { note }
                            const response = await orderService.cancelOrder(order.id, { note: "Khách hàng tự hủy đơn." });
                            if (response && response.status === 200) {
                                Alert.alert("Thành công", response.message || "Đơn hàng đã được hủy.");
                                fetchOrderDetail(); // Tải lại chi tiết đơn hàng để cập nhật trạng thái
                            } else {
                                Alert.alert("Lỗi hủy đơn", response?.message || "Không thể hủy đơn hàng.");
                            }
                        } catch (err) {
                            Alert.alert("Lỗi hủy đơn", err?.message || "Đã xảy ra lỗi khi cố gắng hủy đơn hàng.");
                        } finally {
                            setIsCancelling(false);
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };


    if (isLoading) {
        return <View className="flex-1 justify-center items-center bg-slate-50"><ActivityIndicator size="large" color="#0EA5E9" /></View>;
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-100 p-5">
                <Ionicons name="alert-circle-outline" size={70} color="#F87171" />
                <Text className="text-xl font-semibold text-gray-700 mt-4">Lỗi tải đơn hàng</Text>
                <Text className="text-gray-500 mt-1 text-center mb-3">{error}</Text>
                <TouchableOpacity onPress={fetchOrderDetail} className="bg-sky-500 px-5 py-2.5 rounded-lg shadow active:bg-sky-600">
                    <Text className="text-white font-medium">Thử lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!order) {
        return <View className="flex-1 justify-center items-center bg-slate-100"><Text>Không tìm thấy đơn hàng.</Text></View>;
    }

    const statusInfo = OrderStatusMapping[order.status] || OrderStatusMapping.default;
    const paymentMethodInfo = PaymentMethodMapping[order.paymentMethod] || PaymentMethodMapping.default;
    const paymentStatusInfo = PaymentStatusMapping[order.paymentStatus] || PaymentStatusMapping.default;
    const createdAtDate = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'N/A';

    // Điều kiện hủy đơn: status (1: Chờ xác nhận, 2: Chờ ĐVVC)
    // Backend OrderService.cancerOrder đã có logic kiểm tra: if (status == 0,3,5) thì throw error.
    // Frontend chỉ cần kiểm tra xem trạng thái có cho phép hủy không để hiển thị nút.
    const canCancelOrder = order.status === 1 || order.status === 2;


    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
                    <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <Text className="text-lg font-bold text-sky-600">Đơn hàng #{order.id}</Text>
                        <View className={`px-2.5 py-1 rounded-full flex-row items-center ${statusInfo.bg}`}>
                            <MaterialCommunityIcons name={statusInfo.icon} size={16} color={statusInfo.color.replace('text-', '')} />
                            <Text className={`text-sm font-medium ml-1.5 ${statusInfo.color}`}>{statusInfo.text}</Text>
                        </View>
                    </View>

                    <InfoRow icon="calendar-clock-outline" label="Ngày đặt" value={createdAtDate} />
                    <InfoRow icon="account-circle-outline" label="Người nhận" value={order.fullName} />
                    <InfoRow icon="phone-outline" label="Số điện thoại" value={order.phone} />
                    <InfoRow icon="map-marker-outline" label="Địa chỉ giao" value={order.address} />

                    <InfoRow icon={paymentMethodInfo.icon} label="Phương thức TT">
                        <Text className={`flex-1 text-sm font-medium text-gray-800`}>{paymentMethodInfo.text}</Text>
                    </InfoRow>

                    <InfoRow icon={paymentStatusInfo.icon} label="Trạng thái TT">
                        <Text className={`flex-1 text-sm font-medium ${paymentStatusInfo.color}`}>{paymentStatusInfo.text}</Text>
                    </InfoRow>

                    {order.note && <InfoRow icon="note-text-outline" label="Ghi chú" value={order.note} />}
                </View>

                <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Sản phẩm</Text>
                    {order.orderProducts?.map(item => <OrderProductItem key={item.id.toString()} item={item} />)}
                </View>

                <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Thanh toán</Text>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm text-gray-600">Tổng tiền hàng:</Text>
                        <Text className="text-sm text-gray-800 font-medium">{order.totalPrice?.toLocaleString('vi-VN')}₫</Text>
                    </View>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm text-gray-600">Phí vận chuyển:</Text>
                        <Text className="text-sm text-gray-800 font-medium">0₫</Text>
                    </View>
                    <View className="border-t border-gray-200 pt-2 mt-1 flex-row justify-between items-center">
                        <Text className="text-base font-bold text-gray-800">Thành tiền:</Text>
                        <Text className="text-xl font-bold text-red-600">{order.totalPrice?.toLocaleString('vi-VN')}₫</Text>
                    </View>
                </View>

                {canCancelOrder && (
                    <View className="m-3 mt-4">
                        <TouchableOpacity
                            onPress={handleCancelOrder}
                            disabled={isCancelling}
                            className={`py-3.5 rounded-lg shadow ${isCancelling ? 'bg-gray-400' : 'bg-red-500 active:bg-red-600'}`}
                        >
                            {isCancelling ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text className="text-white text-center text-base font-semibold">Hủy Đơn Hàng</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

export default OrderDetailScreen;