/* ===== NotificationScreen.jsx ===== */
// src/screens/notification/NotificationScreen.jsx
import {useNotification} from '@/contexts/NotificationContext';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import React, {useCallback, useState, useEffect} from 'react';
import {
    ActivityIndicator, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View, Alert, ScrollView
} from 'react-native';

const timeAgo = (isoString) => {
    if (!isoString) return '';
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
        unreadCount,
        isLoading,
        loadingMore,
        error,
        pageIndex,
        totalPages,
        fetchNotifications,
        deleteNotificationById,
        deleteAllNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotification();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleNotificationPress = useCallback(async (item) => {
        // Use 'id' as the primary identifier for the notification item
        if (item && !item.isRead && item.id) {
            await markAsRead(item.id);
        }
        Alert.alert(item.title, item.body || "Không có nội dung chi tiết.");
    }, [markAsRead]);

    const handleClearAllNotifications = () => {
        if (notifications.length === 0 || isLoading) return;
        Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa tất cả thông báo không?", [{text: "Hủy", style: "cancel"}, {
            text: "Xóa Tất Cả", onPress: async () => {
                const success = await deleteAllNotifications();
                if (!success && !isLoading) {
                    Alert.alert("Lỗi", "Không thể xóa tất cả thông báo. Vui lòng thử lại.");
                }
            }, style: "destructive"
        }]);
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 || isLoading) return;
        const success = await markAllAsRead();
        if (!success && !isLoading) {
            Alert.alert("Lỗi", "Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.");
        }
    };

    const handleDeleteOneNotification = useCallback(async (id) => { // Parameter changed to id
        if (!id || isLoading) return;
        const success = await deleteNotificationById(id); // Pass 'id'
        if (!success && !isLoading) {
            Alert.alert("Lỗi", "Không thể xóa thông báo. Vui lòng thử lại.");
        }
    }, [deleteNotificationById, isLoading]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchNotifications(1, true);
        setIsRefreshing(false);
    }, [fetchNotifications]);

    const loadMore = () => {
        if (!loadingMore && !isLoading && pageIndex < totalPages) {
            fetchNotifications(pageIndex + 1);
        }
    };

    const NotificationItem = React.memo(({item}) => {
        console.log(item)
        return (<TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            className={`p-4 border-b border-gray-200 flex-row items-start ${!item.isRead ? 'bg-sky-50' : 'bg-white'}`}
        >
            {!item.isRead && <View className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-2 mt-1.5"/>}
            <View className="mr-3 mt-1">
                <NotificationIcon channel={item.channel} templateCode={item.template_code}/>
            </View>
            <View className="flex-1">
                <Text
                    className={`text-base ${!item.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{item.title}</Text>
                <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={2}>{item.body}</Text>
                <Text className="text-xs text-gray-400 mt-1.5">{timeAgo(item.sent_at || item.createdAt)}</Text>
            </View>
            <TouchableOpacity
                onPress={() => handleDeleteOneNotification(item.id)} // Use 'id'
                className="p-1 ml-2 self-center"
            >
                <Ionicons name="trash-bin-outline" size={20} color="#EF4444"/>
            </TouchableOpacity>
        </TouchableOpacity>)
    });

    if (isLoading && notifications.length === 0 && !isRefreshing) {
        return (<SafeAreaView className="flex-1 justify-center items-center bg-slate-100">
            <ActivityIndicator size="large" color="#0EA5E9"/>
        </SafeAreaView>);
    }

    if (error && notifications.length === 0 && !isLoading && !isRefreshing) {
        return (<SafeAreaView className="flex-1 bg-slate-100">
            <ScrollView
                contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#0EA5E9"]}
                                                tintColor={"#0EA5E9"}/>}
            >
                <MaterialCommunityIcons name="alert-circle-outline" size={70} color="#EF4444"/>
                <Text className="text-xl font-semibold text-red-500 mt-4">Lỗi tải thông báo</Text>
                <Text className="text-gray-500 mt-1 text-center mb-6">{error}</Text>
                <TouchableOpacity
                    onPress={onRefresh}
                    className="bg-sky-500 px-6 py-3 rounded-lg shadow-md active:bg-sky-600"
                >
                    <Text className="text-white font-semibold text-base">Thử lại</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>);
    }

    return (<SafeAreaView className="flex-1 bg-gray-100">
        {(notifications.length > 0 || unreadCount > 0 || error) && (
            <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200 bg-white">
                <TouchableOpacity onPress={handleMarkAllAsRead} disabled={unreadCount === 0 || isLoading}>
                    <Text className={`font-medium ${unreadCount > 0 && !isLoading ? 'text-sky-500' : 'text-gray-400'}`}>
                        Đánh dấu đã đọc ({unreadCount})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClearAllNotifications}
                                  disabled={notifications.length === 0 || isLoading}>
                    <Text
                        className={`font-medium ${notifications.length > 0 && !isLoading ? 'text-red-500' : 'text-gray-400'}`}>Xóa
                        tất cả</Text>
                </TouchableOpacity>
            </View>)}

        {notifications.length === 0 && !isLoading && !isRefreshing && !error ? (<ScrollView
            contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#0EA5E9"]}
                                            tintColor={"#0EA5E9"}/>}
        >
            <Ionicons name="notifications-off-outline" size={80} color="#CBD5E1"/>
            <Text className="text-xl font-semibold text-gray-500 mt-4">Không có thông báo</Text>
            <Text className="text-gray-400 mt-1 text-center">
                Tất cả các thông báo của bạn sẽ xuất hiện ở đây.
            </Text>
        </ScrollView>) : (<FlatList
            data={notifications}
            renderItem={({item}) => <NotificationItem item={item}/>}
            keyExtractor={item => item.id?.toString() || Math.random().toString()} // Use 'id'
            contentContainerStyle={{paddingBottom: 20}}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loadingMore && !isRefreshing ?
                <ActivityIndicator style={{marginVertical: 20}} size="small" color="#0EA5E9"/> : null}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#0EA5E9"]}
                                            tintColor={"#0EA5E9"}/>}
        />)}
    </SafeAreaView>);
}

export default NotificationScreen;