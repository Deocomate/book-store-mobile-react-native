// src/screens/notification/NotificationScreen.jsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

// Dữ liệu giả cho thông báo
const initialFakeNotifications = [
    {
        id: '1',
        title: 'Đơn hàng #BK001256 đã giao thành công!',
        message: 'Cảm ơn bạn đã mua sắm tại BookStore. Đơn hàng của bạn đã được giao đến địa chỉ指定.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 giờ trước
        isRead: false,
        type: 'order_success',
        iconName: 'cart-check',
        iconColor: '#4CAF50', // Green
    },
    {
        id: '2',
        title: 'Flash Sale Sách Kỹ Năng - Giảm đến 40%!',
        message: 'Đừng bỏ lỡ cơ hội sở hữu những cuốn sách kỹ năng hay nhất với giá ưu đãi. Thời gian có hạn!',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 giờ trước
        isRead: true,
        type: 'promotion',
        iconName: 'sale',
        iconColor: '#FF9800', // Orange
    },
    {
        id: '3',
        title: 'Cập nhật chính sách bảo mật',
        message: 'Chúng tôi đã cập nhật chính sách bảo mật để phục vụ bạn tốt hơn. Vui lòng xem chi tiết.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 ngày trước
        isRead: false,
        type: 'system_update',
        iconName: 'shield-check-outline',
        iconColor: '#2196F3', // Blue
    },
    {
        id: '4',
        title: 'Bạn có tin nhắn mới từ bộ phận hỗ trợ',
        message: 'Về yêu cầu #HT00987 của bạn, chúng tôi đã có phản hồi. Vui lòng kiểm tra mục tin nhắn.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
        isRead: true,
        type: 'new_message',
        iconName: 'message-text-outline',
        iconColor: '#03A9F4', // Light Blue
    },
    {
        id: '5',
        title: 'Sản phẩm bạn yêu thích đã có hàng lại!',
        message: 'Sách "Tư Duy Nhanh và Chậm" bạn đã lưu vào danh sách yêu thích hiện đã có hàng trở lại.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 ngày trước
        isRead: false,
        type: 'product_alert',
        iconName: 'bell-ring-outline',
        iconColor: '#795548', // Brown
    },
];

// Hàm định dạng thời gian (ví dụ: 1 giờ trước, 5 phút trước, 1 ngày trước)
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return Math.floor(seconds) + " giây trước";
};


function NotificationScreen() {
    const [notifications, setNotifications] = useState(initialFakeNotifications);
    // const router = useRouter(); // Nếu cần điều hướng

    const handleNotificationPress = useCallback((item) => {
        // Đánh dấu là đã đọc
        setNotifications(prevNotifications =>
            prevNotifications.map(notif =>
                notif.id === item.id ? { ...notif, isRead: true } : notif
            )
        );
        // Có thể điều hướng đến chi tiết thông báo hoặc màn hình liên quan
        // Ví dụ: if (item.type === 'order_success') router.push(`/orders/${item.orderId}`);
        Alert.alert("Thông báo", `Đã mở thông báo: ${item.title}`);
    }, []);

    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notif => ({ ...notif, isRead: true }))
        );
    };

    const clearAllNotifications = () => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn xóa tất cả thông báo không?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa", onPress: () => setNotifications([]), style: "destructive" }
            ]
        );
    };

    const NotificationItem = React.memo(({ item }) => (
        <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            className={`p-4 border-b border-gray-200 flex-row items-start ${!item.isRead ? 'bg-sky-50' : 'bg-white'}`}
        >
            <View className="mr-4 mt-1">
                <MaterialCommunityIcons name={item.iconName || "bell-outline"} size={28} color={item.iconColor || "#6B7280"} />
                {!item.isRead && (
                    <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
            </View>
            <View className="flex-1">
                <Text className={`text-base font-semibold ${!item.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{item.title}</Text>
                <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={2}>{item.message}</Text>
                <Text className="text-xs text-gray-400 mt-1.5">{timeAgo(item.timestamp)}</Text>
            </View>
            {!item.isRead && <View className="w-1.5 h-1.5 bg-sky-500 rounded-full self-center ml-2" />}
        </TouchableOpacity>
    ));


    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* Header đã được định nghĩa trong _layout.js, ở đây có thể thêm các actions chung */}
            <View className="px-4 py-3 flex-row justify-end items-center border-b border-gray-200 bg-white">
                {notifications.some(n => !n.isRead) && (
                    <TouchableOpacity onPress={markAllAsRead} className="mr-4">
                        <Text className="text-sky-600 font-medium">Đánh dấu tất cả đã đọc</Text>
                    </TouchableOpacity>
                )}
                {notifications.length > 0 && (
                    <TouchableOpacity onPress={clearAllNotifications}>
                        <Text className="text-red-500 font-medium">Xóa tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            {notifications.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons name="notifications-off-outline" size={80} color="#CBD5E1" />
                    <Text className="text-xl font-semibold text-gray-500 mt-4">Không có thông báo</Text>
                    <Text className="text-gray-400 mt-1 text-center">
                        Tất cả các thông báo của bạn sẽ xuất hiện ở đây.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={({ item }) => <NotificationItem item={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
}

export default NotificationScreen;