// src/screens/checkout/CheckoutScreen.jsx
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { orderService, paymentService, profileService } from '@/services';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import WebView from 'react-native-webview';

const CheckoutItem = ({ item }) => (<View className="flex-row items-center bg-white p-3 my-1.5 rounded-lg shadow-sm">
    <Image source={{ uri: item.thumbnail }} className="w-16 h-20 rounded-md mr-3" />
    <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-800" numberOfLines={2}>{item.productName}</Text>
        <Text className="text-xs text-gray-500 mt-0.5">Số lượng: {item.quantity}</Text>
        <Text className="text-sm font-medium text-sky-600 mt-0.5">
            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
        </Text>
    </View>
</View>);

const AddressItem = ({ address, onPress, isSelected }) => (<TouchableOpacity
    onPress={onPress}
    className={`p-4 border rounded-lg mb-3 ${isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-200 bg-white'}`}
>
    <View className="flex-row justify-between items-center">
        <Text
            className={`text-base font-semibold ${isSelected ? 'text-sky-700' : 'text-gray-800'}`}>{address.fullName}</Text>
        {isSelected && <Ionicons name="checkmark-circle" size={22} color="#0EA5E9" />}
    </View>
    <Text className="text-sm text-gray-600 mt-0.5">{address.phone}</Text>
    <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={2}>{address.address}</Text>
    {address.gender &&
        <Text className="text-xs text-gray-500 mt-1">Giới tính: {address.gender === 'MALE' ? 'Nam' : 'Nữ'}</Text>}
</TouchableOpacity>);

const PAYMENT_METHODS = [{
    id: 'COD',
    label: 'Thanh toán khi nhận hàng (COD)',
    value: 0,
    icon: 'cash-outline'
}, { id: 'VNPAY', label: 'Thanh toán qua VNPay', value: 1, icon: 'wallet-outline' }, {
    id: 'MOMO',
    label: 'Thanh toán qua MoMo',
    value: 2,
    icon: 'apps-outline'
}, // Giả sử MoMo có giá trị 2
];

function CheckoutScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { removeProductFromCartByProductId } = useCart();
    const params = useLocalSearchParams();

    const parsedCheckoutItems = useMemo(() => {
        try {
            return params.checkoutItems ? JSON.parse(params.checkoutItems) : [];
        } catch (e) {
            console.error("Failed to parse checkoutItems:", e);
            return [];
        }
    }, [params.checkoutItems]);

    const subtotalAmount = useMemo(() => parseFloat(params.subtotalAmount || 0), [params.subtotalAmount]);

    // State để lưu trữ orderId khi tạo đơn hàng thành công, dùng cho điều hướng sau thanh toán
    const [currentOrderId, setCurrentOrderId] = useState(null);


    const [shippingAddresses, setShippingAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0].value);
    const [note, setNote] = useState('');

    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
    const [currentEditingAddress, setCurrentEditingAddress] = useState(null);

    const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const [paymentUrl, setPaymentUrl] = useState('');
    const [showWebViewModal, setShowWebViewModal] = useState(false);

    const shippingFee = 0; // Tạm thời
    const totalAmount = subtotalAmount + shippingFee;

    const fetchShippingAddresses = useCallback(async () => {
        setIsFetchingAddresses(true);
        try {
            const response = await profileService.getMyShippingProfiles(1, 50);
            if (response && response.status === 200 && response.result && response.result.data) {
                const fetchedAddresses = response.result.data;
                setShippingAddresses(fetchedAddresses);
                if (fetchedAddresses.length > 0) {
                    const defaultAddress = fetchedAddresses.find(addr => addr.isDefault) || fetchedAddresses[0];
                    setSelectedAddress(defaultAddress);
                } else {
                    setSelectedAddress(null); // Không có địa chỉ nào
                }
            } else {
                setShippingAddresses([]);
                setSelectedAddress(null);
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ giao hàng.");
        } finally {
            setIsFetchingAddresses(false);
        }
    }, []);

    useEffect(() => {
        fetchShippingAddresses();
    }, [fetchShippingAddresses]);

    useEffect(() => {
        fetchShippingAddresses();
    }, [])

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        setAddressModalVisible(false);
    };

    const handleOpenEditAddressModal = (address = null) => {
        setCurrentEditingAddress(address);
        setEditAddressModalVisible(true);
    };

    const handleSaveAddress = async (addressData) => {
        try {
            setIsFetchingAddresses(true);
            if (currentEditingAddress && currentEditingAddress.id) {
                await profileService.updateShippingProfile(currentEditingAddress.id, addressData);
            } else {
                await profileService.createShippingProfile(addressData);
            }
            await fetchShippingAddresses();
            setEditAddressModalVisible(false);
            setCurrentEditingAddress(null);
            Alert.alert("Thành công", "Địa chỉ đã được lưu.");
        } catch (error) {
            Alert.alert("Lỗi", error?.message || "Không thể lưu địa chỉ.");
        } finally {
            setIsFetchingAddresses(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert("Thiếu thông tin", "Vui lòng chọn địa chỉ giao hàng.");
            return;
        }
        if (parsedCheckoutItems.length === 0) {
            Alert.alert("Giỏ hàng trống", "Không có sản phẩm nào để đặt hàng.");
            return;
        }

        setIsPlacingOrder(true);
        const orderData = {
            profileId: selectedAddress.id,
            paymentMethod: selectedPaymentMethod,
            note: note.trim(),
            orderProducts: parsedCheckoutItems.map(item => ({
                productId: item.productId, quantity: item.quantity,
            })),
        };

        try {
            const orderResponse = await orderService.createOrder(orderData);

            if (orderResponse && orderResponse.status === 201 && orderResponse.result) {
                const createdOrder = orderResponse.result;
                setCurrentOrderId(createdOrder.id); // ⭐ Lưu orderId

                parsedCheckoutItems.forEach(item => {
                    removeProductFromCartByProductId(item.productId);
                });

                if (selectedPaymentMethod === 0) { // COD
                    Alert.alert("Đặt hàng thành công!", `Đơn hàng #${createdOrder.id} của bạn đã được tạo. Chúng tôi sẽ sớm liên hệ với bạn.`);
                    router.replace({ pathname: '/(app)/account/order-history' });
                } else { // Online payment
                    let paymentApiResponse;
                    try {
                        if (selectedPaymentMethod === 1) { // VNPay
                            paymentApiResponse = await paymentService.getVNPayPaymentUrl(createdOrder.id);
                        } else if (selectedPaymentMethod === 2) { // MoMo
                            paymentApiResponse = await paymentService.createMomoPayment(createdOrder.id);
                        }

                        console.log("Payment API Response:", paymentApiResponse);

                        if (paymentApiResponse && paymentApiResponse.status === 200 && paymentApiResponse.result && paymentApiResponse.result.payUrl) {
                            setPaymentUrl(paymentApiResponse.result.payUrl);
                            setShowWebViewModal(true);
                        } else {
                            Alert.alert("Lỗi thanh toán", paymentApiResponse?.message || "Không thể tạo yêu cầu thanh toán. Đơn hàng của bạn (#" + createdOrder.id + ") đã được ghi nhận, vui lòng thử thanh toán lại hoặc liên hệ CSKH.");
                            router.replace({
                                pathname: '/(app)/account/order-details', params: { orderId: createdOrder.id }
                            });
                        }
                    } catch (paymentError) {
                        console.error("Payment initiation error:", paymentError);
                        Alert.alert("Lỗi khởi tạo thanh toán", paymentError?.message || "Không thể khởi tạo thanh toán. Đơn hàng (#" + createdOrder.id + ") đã được tạo.");
                        router.replace({ pathname: '/(app)/account/order-details', params: { orderId: createdOrder.id } });
                    }
                }
            } else {
                Alert.alert("Đặt hàng thất bại", orderResponse?.message || "Đã có lỗi xảy ra, vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Place order error:", error);
            Alert.alert("Lỗi đặt hàng", error?.message || "Không thể đặt hàng. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleWebViewNavigation = (navState) => {
        const { url } = navState;

        console.log("WebView Navigating to (QUAN TRỌNG):", url);

        const isVNPayReturn = url.includes('vnpay_return'); // Điều chỉnh cho đúng path của bạn

        const isMoMoReturn = url.includes('momo_return');   // Điều chỉnh cho đúng path của bạn

        const isLocalRedirectSuccess = url.startsWith('http://localhost:3000');

        if (isLocalRedirectSuccess) {
            console.log("✅ Matched a payment completion URL. Closing WebView.");
            console.log("   isLocalRedirectSuccess:", isLocalRedirectSuccess, "isVNPayReturn:", isVNPayReturn, "isMoMoReturn:", isMoMoReturn);

            setShowWebViewModal(false);
            setPaymentUrl(''); // Dọn dẹp URL thanh toán

            Alert.alert("Hoàn tất thanh toán", "Giao dịch của bạn đã được xử lý. Chúng tôi sẽ chuyển bạn đến chi tiết đơn hàng.", [{
                text: "OK", onPress: () => {
                    router.replace('/(app)/account/order-history');
                }
            }]);
        }
    };

    if (isFetchingAddresses && shippingAddresses.length === 0 && !selectedAddress) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large"
            color="#0EA5E9" /></View>;
    }

    return (<SafeAreaView className="flex-1 bg-slate-100">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Address Section */}
            <View className="p-4 bg-white m-3 rounded-lg shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Địa chỉ giao hàng</Text>
                {isFetchingAddresses && !selectedAddress ? (
                    <ActivityIndicator color="#0EA5E9" />) : selectedAddress ? (<View>
                        <Text
                            className="text-base font-medium text-gray-700">{selectedAddress.fullName} - {selectedAddress.phone}</Text>
                        <Text className="text-sm text-gray-600 mt-0.5"
                            numberOfLines={2}>{selectedAddress.address}</Text>
                    </View>) : (
                    <Text className="text-gray-500">Chưa có địa chỉ nào được chọn hoặc không tải được địa
                        chỉ.</Text>)}
                <TouchableOpacity
                    onPress={() => setAddressModalVisible(true)}
                    className="mt-2 bg-sky-100 py-2 px-3 rounded-md self-start active:bg-sky-200"
                    disabled={isFetchingAddresses}
                >
                    <Text className="text-sky-600 font-medium text-sm">
                        {selectedAddress ? "Thay đổi địa chỉ" : "Chọn hoặc thêm địa chỉ"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Product List */}
            <View className="m-3">
                <Text className="text-lg font-semibold text-gray-800 mb-1 ml-1">Sản phẩm đặt mua</Text>
                {parsedCheckoutItems.length > 0 ? parsedCheckoutItems.map(item => <CheckoutItem
                    key={item.productId?.toString() || Math.random().toString()} item={item} />) :
                    <Text className="text-gray-500 bg-white p-3 rounded-lg shadow-sm">Không có sản phẩm nào trong
                        giỏ hàng.</Text>}
            </View>

            {/* Payment Method */}
            <View className="p-4 bg-white m-3 rounded-lg shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Phương thức thanh toán</Text>
                {PAYMENT_METHODS.map(method => (<TouchableOpacity
                    key={method.id}
                    onPress={() => setSelectedPaymentMethod(method.value)}
                    className={`flex-row items-center p-3 border rounded-lg mb-2 ${selectedPaymentMethod === method.value ? 'border-sky-500 bg-sky-50' : 'border-gray-200 bg-white'}`}
                >
                    <Ionicons name={method.icon} size={22}
                        color={selectedPaymentMethod === method.value ? "#0EA5E9" : "#4B5563"} />
                    <Text
                        className={`ml-3 text-sm font-medium ${selectedPaymentMethod === method.value ? 'text-sky-700' : 'text-gray-700'}`}>{method.label}</Text>
                </TouchableOpacity>))}
            </View>

            {/* Note */}
            <View className="p-4 bg-white m-3 rounded-lg shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Ghi chú cho đơn hàng</Text>
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Ví dụ: Giao hàng giờ hành chính..."
                    className="h-24 border border-gray-300 rounded-lg p-3 text-base text-gray-800 bg-white"
                    multiline
                    textAlignVertical="top"
                />
            </View>

            {/* Order Summary */}
            <View className="p-4 bg-white m-3 mt-0 rounded-lg shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Tổng kết đơn hàng</Text>
                <View className="flex-row justify-between mb-1.5">
                    <Text className="text-sm text-gray-600">Tổng tiền hàng:</Text>
                    <Text
                        className="text-sm text-gray-800 font-medium">{subtotalAmount.toLocaleString('vi-VN')}₫</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-600">Phí vận chuyển:</Text>
                    <Text
                        className="text-sm text-gray-800 font-medium">{shippingFee.toLocaleString('vi-VN')}₫</Text>
                </View>
                <View className="border-t border-gray-200 pt-2 mt-1 flex-row justify-between items-center">
                    <Text className="text-base font-bold text-gray-800">Tổng thanh toán:</Text>
                    <Text className="text-xl font-bold text-sky-600">{totalAmount.toLocaleString('vi-VN')}₫</Text>
                </View>
            </View>
        </ScrollView>

        {/* Place Order Button */}
        <View className="p-3 bg-white border-t border-gray-200 shadow-top-md">
            <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={isPlacingOrder || isFetchingAddresses || parsedCheckoutItems.length === 0}
                className={`py-3.5 rounded-lg shadow ${isPlacingOrder || isFetchingAddresses || parsedCheckoutItems.length === 0 ? 'bg-gray-300' : 'bg-red-500 active:bg-red-600'}`}
            >
                {isPlacingOrder ? (<ActivityIndicator color="#FFFFFF" />) : (
                    <Text className="text-white text-center text-base font-semibold">Đặt Hàng</Text>)}
            </TouchableOpacity>
        </View>

        {/* Address Selection Modal */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={addressModalVisible}
            onRequestClose={() => setAddressModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View className="bg-white w-full max-h-[75%] p-5 rounded-t-xl">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-semibold text-gray-800">Chọn địa chỉ giao hàng</Text>
                        <TouchableOpacity onPress={() => setAddressModalVisible(false)} className="p-1">
                            <Ionicons name="close-circle" size={28} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    {isFetchingAddresses ? <ActivityIndicator /> : (<FlatList
                        data={shippingAddresses}
                        renderItem={({ item }) => (<AddressItem
                            address={item}
                            onPress={() => handleSelectAddress(item)}
                            isSelected={selectedAddress?.id === item.id}
                        />)}
                        keyExtractor={item => item.id.toString()}
                        ListEmptyComponent={<Text className="text-center text-gray-500 my-5">Không có địa chỉ
                            nào. Vui lòng thêm địa chỉ mới.</Text>}
                    />)}
                    <TouchableOpacity
                        onPress={() => {
                            setAddressModalVisible(false);
                            handleOpenEditAddressModal(null);
                        }}
                        className="bg-sky-500 py-3 rounded-lg mt-4 active:bg-sky-600"
                    >
                        <Text className="text-white text-center font-semibold">Thêm địa chỉ mới</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        {/* Add/Edit Address Modal */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={editAddressModalVisible}
            onRequestClose={() => {
                setEditAddressModalVisible(false);
                setCurrentEditingAddress(null);
            }}
        >
            <View style={styles.modalOverlay}>
                <AddEditAddressForm
                    initialData={currentEditingAddress}
                    onSave={handleSaveAddress}
                    onCancel={() => {
                        setEditAddressModalVisible(false);
                        setCurrentEditingAddress(null);
                    }}
                    isSaving={isFetchingAddresses}
                />
            </View>
        </Modal>

        {/* Payment WebView Modal */}
        <Modal
            visible={showWebViewModal}
            onRequestClose={() => { // Xử lý khi người dùng nhấn nút back cứng trên Android
                Alert.alert("Hủy thanh toán?", "Bạn có chắc muốn hủy quá trình thanh toán và quay lại?", [{
                    text: "Tiếp tục thanh toán", style: "cancel", onPress: () => { /* Để modal mở */
                    }
                }, {
                    text: "Hủy và Thoát", style: "destructive", onPress: () => {
                        setShowWebViewModal(false);
                        setPaymentUrl('');
                        // Chuyển về chi tiết đơn hàng vừa tạo hoặc lịch sử đơn hàng
                        if (currentOrderId) {
                            router.replace({
                                pathname: '/(app)/account/order-details', params: { orderId: currentOrderId }
                            });
                        } else {
                            router.replace('/(app)/account/order-history/');
                        }
                    }
                }], { cancelable: true });
            }}
            animationType="slide"
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e5e7eb'
                }}>
                    <TouchableOpacity onPress={() => { // Nút X để đóng WebView
                        Alert.alert("Đóng thanh toán?", "Bạn có muốn đóng cửa sổ thanh toán này không? Đơn hàng của bạn đã được tạo.", [{
                            text: "Tiếp tục thanh toán",
                            style: "cancel"
                        }, {
                            text: "Đóng", style: "default", onPress: () => {
                                setShowWebViewModal(false);
                                setPaymentUrl('');
                                router.replace('/(app)/account/order-history');
                            }
                        }]);
                    }}>
                        <Ionicons name="close" size={30} color="#374151" />
                    </TouchableOpacity>
                </View>
                {paymentUrl ? (<WebView
                    source={{ uri: paymentUrl }}
                    onNavigationStateChange={handleWebViewNavigation}
                    startInLoadingState={true}
                    renderLoading={() => <ActivityIndicator size="large" style={StyleSheet.absoluteFill}
                        color="#0EA5E9" />}
                // Thêm các props cần thiết khác cho WebView
                // originWhitelist={['*']} // Cẩn thận khi dùng wildcard
                // javaScriptEnabled={true}
                // domStorageEnabled={true}
                />) :
                    <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} color="#0EA5E9" />}
            </SafeAreaView>
        </Modal>
    </SafeAreaView>);
}

const AddEditAddressForm = ({ initialData, onSave, onCancel, isSaving }) => {
    const [fullName, setFullName] = useState(initialData?.fullName || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [gender, setGender] = useState(initialData?.gender || 'MALE');

    const handleSubmit = () => {
        if (!fullName.trim() || !phone.trim() || !address.trim()) {
            Alert.alert("Thông tin bắt buộc", "Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.");
            return;
        }
        if (!/^\d{10}$/.test(phone.trim())) {
            Alert.alert("Số điện thoại không hợp lệ", "Vui lòng nhập số điện thoại gồm 10 chữ số.");
            return;
        }
        onSave({ fullName: fullName.trim(), phone: phone.trim(), address: address.trim(), gender });
    };

    return (<View className="bg-white w-full p-5 rounded-t-xl max-h-[90%]">
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">
                {initialData ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </Text>
            <TouchableOpacity onPress={onCancel} className="p-1">
                <Ionicons name="close-circle" size={28} color="#6B7280" />
            </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="space-y-4">
                <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Họ và tên người nhận"
                    placeholderTextColor="#9CA3AF" // Thêm: Màu cho placeholder
                    className="mb-3 border border-gray-300 p-3 rounded-lg text-base bg-white focus:border-sky-500" // Thêm: focus style
                />
                <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Số điện thoại"
                    placeholderTextColor="#9CA3AF" // Thêm: Màu cho placeholder
                    keyboardType="phone-pad"
                    className="mb-3 border border-gray-300 p-3 rounded-lg text-base bg-white focus:border-sky-500" // Thêm: focus style
                />
                <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/TP)"
                    placeholderTextColor="#9CA3AF" // Thêm: Màu cho placeholder
                    multiline
                    className="mb-3 border border-gray-300 p-3 rounded-lg text-base h-28 bg-white focus:border-sky-500" // Thêm: focus style
                    textAlignVertical="top"
                />
                <View className="flex-row justify-start space-x-4 items-center py-2">
                    <Text className="text-base text-gray-700 mr-3">Giới tính:</Text>
                    <TouchableOpacity onPress={() => setGender('MALE')} className="flex-row items-center mr-3">
                        <MaterialCommunityIcons name={gender === 'MALE' ? 'radiobox-marked' : 'radiobox-blank'}
                            size={24} color={gender === 'MALE' ? '#0EA5E9' : '#6B7280'} />
                        <Text className="ml-1.5 text-base">Nam</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setGender('FEMALE')} className="flex-row items-center">
                        <MaterialCommunityIcons name={gender === 'FEMALE' ? 'radiobox-marked' : 'radiobox-blank'}
                            size={24} color={gender === 'FEMALE' ? '#0EA5E9' : '#6B7280'} />
                        <Text className="ml-1.5 text-base">Nữ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        <View className="flex-row mt-6 space-x-3 pt-4 border-t border-gray-200">
            <TouchableOpacity onPress={onCancel} className="flex-1 bg-gray-200 py-3 rounded-lg active:bg-gray-300 mr-3">
                <Text className="text-center text-gray-700 font-semibold">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={isSaving}
                className={`flex-1 py-3 rounded-lg ${isSaving ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}>
                {isSaving ? <ActivityIndicator color="white" /> :
                    <Text className="text-center text-white font-semibold">Lưu địa chỉ</Text>}
            </TouchableOpacity>
        </View>
    </View>);
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', // Thay 'flex-end' bằng 'center'
        alignItems: 'center',
        padding: 20,    // Thêm dòng này để căn giữa theo chiều ngang
    },
});

export default CheckoutScreen;