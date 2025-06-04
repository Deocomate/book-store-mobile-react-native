// src/screens/notification/NotificationScreen.jsx
import {useNotification} from '@/contexts/NotificationContext';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import React, {useCallback, useState} from 'react'; // Removed useEffect as initial fetch is in context
import {
    ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View
} from 'react-native';

const timeAgo = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
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

const NotificationIcon = ({channel, templateCode}) => {
    let iconName = "bell-outline";
    let iconColor = "#6B7280";

    if (channel === 'EMAIL') {
        iconName = "email-outline";
        iconColor = "#0284c7";
    } else if (channel === 'PUSH_NOTIFICATION') {
        iconName = "bell-ring-outline";
        iconColor = "#fb923c";
    } else if (channel === 'SMS') {
        iconName = "message-text-outline";
        iconColor = "#3b82f6";
    }

    if (templateCode) {
        if (templateCode.includes("order")) {
            iconName = "cart-check";
            iconColor = "#16a34a";
        } else if (templateCode.includes("otp")) {
            iconName = "key-variant";
            iconColor = "#f59e0b";
        }
    }
    return <MaterialCommunityIcons name={iconName} size={28} color={iconColor}/>;
};


function NotificationScreen() {
    const {
        notifications,
        isLoading,
        loadingMore,
        error,
        pageIndex,
        totalPages,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotificationById,
        deleteAllNotifications, // Use this from context
    } = useNotification();

    const [isRefreshing, setIsRefreshing] = useState(false); // Local state for RefreshControl

    const handleNotificationPress = useCallback(async (item) => {
        if (item.status !== 'READ') {
            const success = await markAsRead(item.notification_log_id);
            if (!success) {
                Alert.alert("Lỗi", "Không thể đánh dấu đã đọc. Vui lòng thử lại.");
            }
        }
        Alert.alert("Thông báo", `Đã mở thông báo: ${item.title}`);
    }, [markAsRead]);

    const handleMarkAllAsRead = async () => {
        if (notifications.some(n => n.status !== 'READ' && n.status !== 'FAILED')) {
            const success = await markAllAsRead();
            if (!success) {
                Alert.alert("Lỗi", "Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.");
            }
        }
    };

    const handleClearAllNotifications = () => {
        Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa tất cả thông báo không?", [{text: "Hủy", style: "cancel"}, {
            text: "Xóa", onPress: async () => {
                const success = await deleteAllNotifications(); // Call from context
                if (!success && !isLoading) { // Check !isLoading to avoid double alert if error is already set by context
                    Alert.alert("Lỗi", "Không thể xóa tất cả thông báo. Vui lòng thử lại.");
                }
            }, style: "destructive"
        }]);
    };

    const handleDeleteOneNotification = useCallback(async (notificationLogId) => {
        Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa thông báo này?", [{text: "Hủy", style: "cancel"}, {
            text: "Xóa", style: "destructive", onPress: async () => {
                const success = await deleteNotificationById(notificationLogId);
                if (!success) {
                    Alert.alert("Lỗi", "Không thể xóa thông báo. Vui lòng thử lại.");
                }
            },
        },]);
    }, [deleteNotificationById]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchNotifications(1, true); // page = 1, isRefreshing = true
        setIsRefreshing(false);
    }, [fetchNotifications]);

    const loadMore = () => {
        if (!loadingMore && !isLoading && pageIndex < totalPages) {
            fetchNotifications(pageIndex + 1);
        }
    };

    const NotificationItem = React.memo(({item}) => (<TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        className={`p-4 border-b border-gray-200 flex-row items-start ${item.status !== 'READ' && item.status !== 'FAILED' ? 'bg-sky-50' : 'bg-white'}`}
    >
        <View className="mr-4 mt-1">
            <NotificationIcon channel={item.channel} templateCode={item.template_code}/>
            {item.status !== 'READ' && item.status !== 'FAILED' && (
                <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"/>)}
        </View>
        <View className="flex-1">
            <Text
                className={`text-base font-semibold ${item.status !== 'READ' && item.status !== 'FAILED' ? 'text-gray-900' : 'text-gray-700'}`}>{item.title}</Text>
            <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={2}>{item.body}</Text>
            <Text className="text-xs text-gray-400 mt-1.5">{timeAgo(item.sent_at || item.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteOneNotification(item.notification_log_id)}
                          className="p-1 ml-2 self-center">
            <Ionicons name="trash-bin-outline" size={20} color="#EF4444"/>
        </TouchableOpacity>
    </TouchableOpacity>));

    // Show main loading indicator only on initial load when notifications array is empty
    if (isLoading && notifications.length === 0 && !isRefreshing) {
        return (<SafeAreaView className="flex-1 justify-center items-center bg-slate-100">
            <ActivityIndicator size="large" color="#0EA5E9"/>
        </SafeAreaView>);
    }

    if (error && notifications.length === 0) {
        return (<SafeAreaView className="flex-1 justify-center items-center bg-slate-100 p-5">
            <MaterialCommunityIcons name="alert-circle-outline" size={70} color="#EF4444"/>
            <Text className="text-xl font-semibold text-red-500 mt-4">Lỗi tải thông báo</Text>
            <Text className="text-gray-500 mt-1 text-center mb-6">{error}</Text>
            <TouchableOpacity
                onPress={onRefresh}
                className="bg-sky-500 px-6 py-3 rounded-lg shadow-md active:bg-sky-600"
            >
                <Text className="text-white font-semibold text-base">Thử lại</Text>
            </TouchableOpacity>
        </SafeAreaView>);
    }

    return (<SafeAreaView className="flex-1 bg-gray-100">
        <View className="px-4 py-3 flex-row justify-end items-center border-b border-gray-200 bg-white">
            {notifications.some(n => n.status !== 'READ' && n.status !== 'FAILED') && (
                <TouchableOpacity onPress={handleMarkAllAsRead} className="mr-4">
                    <Text className="text-sky-600 font-medium">Đánh dấu tất cả đã đọc</Text>
                </TouchableOpacity>)}
            {notifications.length > 0 && (<TouchableOpacity onPress={handleClearAllNotifications}>
                <Text className="text-red-500 font-medium">Xóa tất cả</Text>
            </TouchableOpacity>)}
        </View>

        {notifications.length === 0 && !isLoading && !isRefreshing ? (
            <View className="flex-1 justify-center items-center p-5">
                <Ionicons name="notifications-off-outline" size={80} color="#CBD5E1"/>
                <Text className="text-xl font-semibold text-gray-500 mt-4">Không có thông báo</Text>
                <Text className="text-gray-400 mt-1 text-center">
                    Tất cả các thông báo của bạn sẽ xuất hiện ở đây.
                </Text>
            </View>) : (<FlatList
            data={notifications}
            renderItem={({item}) => <NotificationItem item={item}/>}
            keyExtractor={item => item.notification_log_id?.toString() || item.id?.toString() || Math.random().toString()} // Robust key
            contentContainerStyle={{paddingBottom: 20}}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loadingMore ?
                <ActivityIndicator style={{marginVertical: 20}} size="small" color="#0EA5E9"/> : null}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#0EA5E9"]}
                                            tintColor={"#0EA5E9"}/>}
        />)}
    </SafeAreaView>);
}

export default NotificationScreen;