// src/screens/account/ShippingAddressesScreen.jsx
import { profileService } from '@/services';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Component Form thêm/sửa địa chỉ
const AddEditAddressForm = ({ initialData, onSave, onCancel, isSaving }) => {
    const [fullName, setFullName] = useState(initialData?.fullName || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [gender, setGender] = useState(initialData?.gender || 'MALE'); // Default MALE
    const [isDefault, setIsDefault] = useState(initialData?.isDefault || false); // Thêm isDefault

    const handleSubmit = () => {
        if (!fullName.trim() || !phone.trim() || !address.trim()) {
            Alert.alert("Thông tin bắt buộc", "Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.");
            return;
        }
        if (!/^\d{10}$/.test(phone.trim())) {
            Alert.alert("Số điện thoại không hợp lệ", "Vui lòng nhập số điện thoại gồm 10 chữ số.");
            return;
        }
        onSave({
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            gender,
            isDefault // Truyền isDefault
        });
    };

    return (
        <View className="bg-white w-full p-5 rounded-xl max-h-[90%]">
            <Text className="text-xl font-semibold text-gray-800 mb-5">
                {initialData?.id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} className="mb-3">
                <View className="space-y-4">
                    <View className='mb-3'>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Họ và tên người nhận</Text>
                        <TextInput value={fullName} onChangeText={setFullName} placeholder="Ví dụ: Nguyễn Văn A" className="border border-gray-300 p-3 rounded-lg text-base bg-white" />
                    </View>
                    <View className='mb-3'>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Số điện thoại</Text>
                        <TextInput value={phone} onChangeText={setPhone} placeholder="Ví dụ: 09xxxxxxxx" keyboardType="phone-pad" className="border border-gray-300 p-3 rounded-lg text-base bg-white" />
                    </View>
                    <View className='mb-3'>
                        <Text className="text-sm font-medium text-gray-500 mb-1">Địa chỉ chi tiết</Text>
                        <TextInput value={address} onChangeText={setAddress} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" multiline className="border border-gray-300 p-3 rounded-lg text-base h-24 bg-white" textAlignVertical="top" />
                    </View>
                    <View className="flex-row justify-start space-x-4 items-center py-2">
                        <Text className="text-base text-gray-700 mr-3">Giới tính:</Text>
                        <TouchableOpacity onPress={() => setGender('MALE')} className="flex-row items-center mr-3">
                            <MaterialCommunityIcons name={gender === 'MALE' ? 'radiobox-marked' : 'radiobox-blank'} size={24} color={gender === 'MALE' ? '#0EA5E9' : '#6B7280'} />
                            <Text className="ml-1.5 text-base">Nam</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setGender('FEMALE')} className="flex-row items-center">
                            <MaterialCommunityIcons name={gender === 'FEMALE' ? 'radiobox-marked' : 'radiobox-blank'} size={24} color={gender === 'FEMALE' ? '#0EA5E9' : '#6B7280'} />
                            <Text className="ml-1.5 text-base">Nữ</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setIsDefault(!isDefault)} className="flex-row items-center py-2">
                        <MaterialCommunityIcons name={isDefault ? 'checkbox-marked-outline' : 'checkbox-blank-outline'} size={24} color={isDefault ? '#0EA5E9' : '#6B7280'} />
                        <Text className="ml-2 text-base text-gray-700">Đặt làm địa chỉ mặc định</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View className="flex-row mt-auto space-x-3 border-t border-gray-200 pt-4">
                <TouchableOpacity onPress={onCancel} className="flex-1 bg-gray-200 py-3 rounded-lg active:bg-gray-300 mr-3">
                    <Text className="text-center text-gray-700 font-semibold">Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} disabled={isSaving} className={`flex-1 py-3 rounded-lg ${isSaving ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}>
                    {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-center text-white font-semibold">Lưu địa chỉ</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};


function ShippingAddressesScreen() {
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // For add/edit/delete operations
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const [modalVisible, setModalVisible] = useState(false);
    const [currentAddress, setCurrentAddress] = useState(null); // For editing, null for adding

    const fetchAddresses = useCallback(async (page = 1, refreshing = false) => {
        if (!refreshing && page > 1 && page > totalPages) return;
        if (refreshing || page === 1) setIsLoading(true); // Main loading for first fetch or refresh
        else setIsSubmitting(true); // Use isSubmitting for subsequent page loads to show footer loader

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
            setIsSubmitting(false);
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
        if (!isLoading && !isSubmitting && pageIndex < totalPages) {
            fetchAddresses(pageIndex + 1);
        }
    };

    const handleAddNewAddress = () => {
        setCurrentAddress(null);
        setModalVisible(true);
    };

    const handleEditAddress = (address) => {
        setCurrentAddress(address);
        setModalVisible(true);
    };

    const handleSaveAddress = async (addressData) => {
        setIsSubmitting(true);
        try {
            if (currentAddress && currentAddress.id) {
                await profileService.updateShippingProfile(currentAddress.id, addressData);
            } else {
                await profileService.createShippingProfile(addressData);
            }
            setModalVisible(false);
            Alert.alert("Thành công", `Địa chỉ đã được ${currentAddress ? 'cập nhật' : 'thêm mới'}.`);
            fetchAddresses(1, true); // Refresh list from page 1
        } catch (error) {
            Alert.alert("Lỗi", error?.message || "Không thể lưu địa chỉ.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAddress = (profileId) => {
        Alert.alert(
            "Xác nhận xóa", "Bạn có chắc chắn muốn xóa địa chỉ này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            const response = await profileService.deleteShippingProfile(profileId);
                            if (response && response.status === 200) {
                                Alert.alert("Thành công", "Địa chỉ đã được xóa.");
                                fetchAddresses(1, true);
                            } else {
                                Alert.alert("Lỗi", response?.message || "Không thể xóa địa chỉ.");
                            }
                        } catch (error) {
                            Alert.alert("Lỗi", error?.message || "Đã xảy ra lỗi khi xóa.");
                        } finally {
                            setIsSubmitting(false);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const renderAddressItem = ({ item }) => (
        <View className={`bg-white p-4 mb-3 mx-3 rounded-lg shadow-md ${item.isDefault ? 'border-2 border-sky-500' : ''}`}>
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="text-base font-semibold text-gray-800">{item.fullName}</Text>
                        {item.isDefault && <View className="ml-2 bg-sky-100 px-2 py-0.5 rounded-full"><Text className="text-xs text-sky-600 font-medium">Mặc định</Text></View>}
                    </View>
                    <Text className="text-sm text-gray-600 mt-0.5">{item.phone}</Text>
                    <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={2}>{item.address}</Text>
                    {item.gender && <Text className="text-xs text-gray-500 mt-1">Giới tính: {item.gender === 'MALE' ? 'Nam' : 'Nữ'}</Text>}
                </View>
                <View className="flex-row space-x-1">
                    <TouchableOpacity onPress={() => handleEditAddress(item)} className="p-1.5">
                        <MaterialCommunityIcons name="pencil-outline" size={22} color="#3B82F6" />
                    </TouchableOpacity>
                    {!item.isDefault && ( // Chỉ cho phép xóa nếu không phải mặc định, hoặc cần logic phức tạp hơn
                        <TouchableOpacity onPress={() => handleDeleteAddress(item.id)} className="p-1.5">
                            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    if (isLoading && pageIndex === 1 && !isRefreshing) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0EA5E9" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <TouchableOpacity
                onPress={handleAddNewAddress}
                className="bg-sky-500 m-3 py-3.5 rounded-lg shadow-md active:bg-sky-600 flex-row justify-center items-center"
            >
                <Ionicons name="add-circle-outline" size={22} color="white" />
                <Text className="text-white text-center text-base font-semibold ml-2">Thêm Địa Chỉ Mới</Text>
            </TouchableOpacity>

            {addresses.length === 0 && !isLoading ? (
                <View className="flex-1 justify-center items-center p-5 -mt-16">
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
                    ListFooterComponent={isSubmitting && pageIndex > 1 ? <ActivityIndicator size="small" color="#0EA5E9" style={{ marginVertical: 20 }} /> : null}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#0EA5E9"]} tintColor={"#0EA5E9"} />
                    }
                />
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setCurrentAddress(null); // Reset current address khi đóng modal
                }}
            >
                <View style={styles.modalOverlay}>
                    <AddEditAddressForm
                        initialData={currentAddress}
                        onSave={handleSaveAddress}
                        onCancel={() => {
                            setModalVisible(false);
                            setCurrentAddress(null);
                        }}
                        isSaving={isSubmitting}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', // Thay 'flex-end' bằng 'center'
        alignItems: 'center',
        padding: 20,    // Thêm dòng này để căn giữa theo chiều ngang
    },
});

export default ShippingAddressesScreen;