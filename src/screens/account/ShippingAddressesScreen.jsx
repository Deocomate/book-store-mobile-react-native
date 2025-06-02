
/* ===== src/screens/account/ShippingAddressesScreen.jsx ===== */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { profileService } from '@/services';
import { useRouter } from 'expo-router'; // If you need to navigate to add/edit address
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

function ShippingAddressesScreen() {
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const fetchAddresses = useCallback(async (page = 1, refreshing = false) => {
        if (!refreshing && page > 1 && page > totalPages) return;
        if (refreshing) setIsLoading(true);

        try {
            const response = await profileService.getMyShippingProfiles(page, pageSize);
            if (response && response.status === 200 && response.result) {
                const newAddresses = response.result.data || [];
                setAddresses(prev => (page === 1 ? newAddresses : [...prev, ...newAddresses]));
                setTotalPages(response.result.totalPages || 1);
                setPageIndex(page);
            } else {
                Alert.alert("Lỗi", response?.message || "Không thể tải danh sách địa chỉ.");
            }
        } catch (error) {
            console.error("Fetch addresses error:", error);
            Alert.alert("Lỗi", error?.message || "Đã có lỗi xảy ra khi tải địa chỉ.");
        } finally {
            setIsLoading(false);
            if (refreshing) setIsRefreshing(false);
        }
    }, [totalPages]);

    useEffect(() => {
        fetchAddresses(1, true);
    }, [fetchAddresses]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchAddresses(1, true);
    };

    const loadMoreAddresses = () => {
        if (!isLoading && pageIndex < totalPages) {
            fetchAddresses(pageIndex + 1);
        }
    };

    const handleDeleteAddress = (profileId) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa địa chỉ này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    onPress: async () => {
                        try {
                            setIsLoading(true); // Consider a more specific loading state
                            const response = await profileService.deleteShippingProfile(profileId);
                            if (response && response.status === 200) {
                                Alert.alert("Thành công", "Địa chỉ đã được xóa.");
                                fetchAddresses(1, true); // Refresh list
                            } else {
                                Alert.alert("Lỗi", response?.message || "Không thể xóa địa chỉ.");
                            }
                        } catch (error) {
                            Alert.alert("Lỗi", error?.message || "Đã xảy ra lỗi khi xóa địa chỉ.");
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const renderAddressItem = ({ item }) => (
        <View className="bg-white p-4 mb-3 mx-3 rounded-lg shadow-md">
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-800">{item.fullName}</Text>
                    <Text className="text-sm text-gray-600 mt-0.5">{item.phone}</Text>
                    <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={2}>{item.address}</Text>
                    {item.gender && <Text className="text-xs text-gray-500 mt-1">Giới tính: {item.gender === 'MALE' ? 'Nam' : 'Nữ'}</Text>}
                </View>
                <View className="flex-row space-x-1">
                    <TouchableOpacity
                        onPress={() => Alert.alert("Chỉnh sửa", `Chỉnh sửa địa chỉ ${item.id} (chức năng đang phát triển).`)} // TODO: Navigate to edit address screen
                        className="p-1.5"
                    >
                        <MaterialCommunityIcons name="pencil-outline" size={22} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteAddress(item.id)} className="p-1.5">
                        <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
            {/* TODO: Add "Set as default" button if applicable */}
        </View>
    );

    if (isLoading && pageIndex === 1 && !isRefreshing) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0EA5E9" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <TouchableOpacity
                onPress={() => Alert.alert("Thêm địa chỉ", "Chức năng thêm địa chỉ mới đang phát triển.")} // TODO: Navigate to add address screen
                className="bg-sky-500 m-3 py-3.5 rounded-lg shadow-md active:bg-sky-600 flex-row justify-center items-center"
            >
                <Ionicons name="add-circle-outline" size={22} color="white" />
                <Text className="text-white text-center text-base font-semibold ml-2">Thêm Địa Chỉ Mới</Text>
            </TouchableOpacity>

            {addresses.length === 0 && !isLoading ? (
                <View className="flex-1 justify-center items-center p-5 -mt-16"> {/* Adjust mt to pull up */}
                    <MaterialCommunityIcons name="map-marker-off-outline" size={70} color="#CBD5E1" />
                    <Text className="text-xl font-semibold text-gray-500 mt-4">Chưa có địa chỉ nào</Text>
                    <Text className="text-gray-400 mt-1 text-center">
                        Thêm địa chỉ giao hàng để việc mua sắm nhanh chóng hơn.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingTop: 6, paddingBottom: 20 }}
                    onEndReached={loadMoreAddresses}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isLoading && pageIndex > 1 ? <ActivityIndicator size="small" color="#0EA5E9" style={{ marginVertical: 20 }} /> : null}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#0EA5E9"]} tintColor={"#0EA5E9"} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

export default ShippingAddressesScreen;