import { useAuth } from '@/contexts/AuthContext';
import { orderService, productService } from '@/services';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const OrderStatusMapping = {
    0: {
        text: 'Đã giao hàng',
        color: 'text-green-600',
        bg: 'bg-green-100',
        icon: 'package-variant-closed-check',
        isDelivered: true
    },
    1: { text: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-100', icon: 'timer-sand-outline' },
    2: { text: 'Chờ vận chuyển', color: 'text-blue-600', bg: 'bg-blue-100', icon: 'package-variant' },
    3: { text: 'Đang vận chuyển', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: 'truck-delivery-outline' },
    4: {
        text: 'Đã giao', color: 'text-green-600', bg: 'bg-green-100', icon: 'check-decagram-outline', isDelivered: true
    },
    5: { text: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-100', icon: 'cancel' },
    default: { text: 'Không xác định', color: 'text-gray-600', bg: 'bg-gray-100', icon: 'help-circle-outline' },
};

const PaymentMethodMapping = {
    0: { text: 'Thanh toán khi nhận hàng (COD)', icon: 'cash-multiple' },
    1: { text: 'Thanh toán qua VNPay', icon: 'credit-card-outline' },
    2: { text: 'Thanh toán qua MoMo', icon: 'cellphone-marker' },
    default: { text: 'Khác', icon: 'help-circle-outline' }
};

const PaymentStatusMapping = {
    0: { text: 'Đã thanh toán', color: 'text-green-600', icon: 'check-circle-outline' },
    1: { text: 'Chưa thanh toán', color: 'text-amber-600', icon: 'alert-circle-outline' },
    2: { text: 'Đã hoàn tiền', color: 'text-blue-600', icon: 'cash-refund' },
    3: { text: 'Thanh toán thất bại', color: 'text-red-500', icon: 'close-circle-outline' },
    default: { text: 'Không xác định', color: 'text-gray-500', icon: 'help-circle-outline' },
};

const StarRatingInput = ({ rating, setRating, disabled }) => {
    return (<View className="flex-row justify-center my-3">
        {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => !disabled && setRating(star)} disabled={disabled}>
                <FontAwesome
                    name={star <= rating ? "star" : "star-o"}
                    size={32}
                    color={star <= rating ? "#FFC107" : "#CBD5E1"}
                    style={{ marginRight: 10 }}
                />
            </TouchableOpacity>))}
    </View>);
};

const ProductRatingModal = ({
    visible,
    onClose,
    onSubmit,
    productInfo,
    initialRating = 0,
    initialComment = '',
    isLoading
}) => {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (visible) {
            setRating(initialRating || 0);
            setComment(initialComment || '');
            setFormError('');
        }
    }, [visible, initialRating, initialComment]);

    const handleSubmit = () => {
        setFormError('');
        if (rating === 0) {
            setFormError("Vui lòng chọn số sao đánh giá.");
            return;
        }
        if (!comment.trim()) {
            setFormError("Vui lòng nhập bình luận của bạn.");
            return;
        }
        onSubmit(productInfo?.productId, rating, comment);
    };

    if (!productInfo) return null;

    return (<Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View className="bg-white w-11/12 max-w-lg p-5 rounded-xl shadow-xl">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-xl font-bold text-sky-700">Đánh giá sản phẩm</Text>
                    <TouchableOpacity onPress={onClose} className="p-1" disabled={isLoading}>
                        <Ionicons name="close-circle" size={28} color="#6B7280" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: Platform.OS === 'ios' ? 450 : 400 }}
                    keyboardShouldPersistTaps="handled">
                    <View className="items-center mb-3">
                        <Image source={{ uri: productInfo.thumbnail || 'https://placehold.co/100x120' }}
                            className="w-20 h-28 rounded-md mb-2" />
                        <Text className="text-base font-semibold text-gray-800 text-center"
                            numberOfLines={2}>{productInfo.productName}</Text>
                    </View>

                    {formError ? (<View className="bg-red-100 p-2.5 rounded-md mb-3">
                        <Text className="text-red-700 text-sm text-center">{formError}</Text>
                    </View>) : null}

                    <StarRatingInput rating={rating} setRating={setRating} disabled={isLoading} />
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Viết bình luận của bạn ở đây..."
                        multiline
                        numberOfLines={4}
                        className="border border-gray-300 p-3 rounded-lg text-base h-28 bg-white mt-2"
                        textAlignVertical="top"
                        editable={!isLoading}
                    />
                </ScrollView>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className={`mt-5 py-3 rounded-lg shadow ${isLoading ? 'bg-sky-300' : 'bg-sky-500 active:bg-sky-600'}`}
                >
                    {isLoading ? <ActivityIndicator color="white" /> :
                        <Text className="text-white text-center font-semibold text-base">Gửi Đánh Giá</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </Modal>);
};


const OrderProductItem = ({ item, onRatePress, orderStatusIsDelivered, userRating }) => {
    console.log(item.thumbnail);
    return (
        <View className="bg-slate-50 p-3 my-1.5 rounded-md border border-slate-200">
            <View className="flex-row items-center">
                <View className="w-16 h-20 rounded mr-3 bg-gray-200 items-center justify-center">
                    <Image source={{ uri: item.thumbnail || 'https://placehold.co/64x80' }} className="w-full h-full rounded"
                        resizeMode="cover" />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-800" numberOfLines={2}>{item.productName}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">Số lượng: {item.quantity}</Text>
                    <Text className="text-xs text-gray-500">Đơn giá: {item.price?.toLocaleString('vi-VN')}₫</Text>
                </View>
                <Text className="text-sm font-semibold text-sky-700 ml-2">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </Text>
            </View>
            {orderStatusIsDelivered && (<TouchableOpacity
                onPress={() => onRatePress(item)}
                className="mt-2 bg-sky-100 py-1.5 px-3 rounded-md self-start active:bg-sky-200"
            >
                <Text className="text-sky-600 font-medium text-xs">
                    {userRating ? "Sửa đánh giá" : "Đánh giá sản phẩm"}
                </Text>
            </TouchableOpacity>)}
        </View>)
};

const InfoRow = ({ icon, label, value, valueColor = 'text-gray-800', children }) => (
    <View className="flex-row items-start py-2 border-b border-slate-100">
        <MaterialCommunityIcons name={icon} size={20} color="#4B5563" className="mr-3 mt-0.5" />
        <Text className="w-2/5 text-sm text-gray-600">{label}:</Text>
        {value !== undefined && <Text className={`flex-1 text-sm font-medium ${valueColor}`}>{value || 'N/A'}</Text>}
        {children}
    </View>);

function OrderDetailScreen({ orderId }) {
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedProductToRate, setSelectedProductToRate] = useState(null);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [userRatings, setUserRatings] = useState({}); // Stores { productId: rateObject }
    const [editingRateId, setEditingRateId] = useState(null);
    const [initialRatingForModal, setInitialRatingForModal] = useState(0);
    const [initialCommentForModal, setInitialCommentForModal] = useState('');


    const fetchOrderAndRatings = useCallback(async () => {
        if (!orderId) {
            setError("ID đơn hàng không hợp lệ.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await orderService.getMyOrderById(orderId);

            console.log("Order Detail Res: ", response);

            if (response && response.status === 200 && response.result) {
                const fetchedOrder = response.result;
                setOrder(fetchedOrder);

                if (fetchedOrder.orderProducts && fetchedOrder.orderProducts.length > 0 && user?.id) {
                    const ratingsMap = {};
                    for (const productItem of fetchedOrder.orderProducts) {
                        try {
                            // Fetch all ratings for a product to find the current user's one
                            // Adjust pageSize if a user can have many ratings (though unlikely for this model)
                            const ratesResponse = await productService.getRatesByProductId(productItem.productId, 1, 100);
                            if (ratesResponse && ratesResponse.status === 200 && ratesResponse.result && ratesResponse.result.data) {
                                const currentUserRating = ratesResponse.result.data.find(rate => rate.userId === parseInt(user.id) // Ensure user.id is compared as a number
                                );
                                if (currentUserRating) {
                                    ratingsMap[productItem.productId] = currentUserRating;
                                }
                            }
                        } catch (rateError) {
                            console.warn(`Could not fetch ratings for product ${productItem.productId}:`, rateError);
                        }
                    }
                    setUserRatings(ratingsMap);
                }
            } else {
                throw new Error(response?.message || "Không thể tải chi tiết đơn hàng.");
            }
        } catch (err) {
            setError(err.message || "Đã có lỗi xảy ra.");
        } finally {
            setIsLoading(false);
        }
    }, [orderId, user?.id]);

    useEffect(() => {
        fetchOrderAndRatings();
    }, [fetchOrderAndRatings]);

    const handleCancelOrder = async () => {
        if (!order) return;
        Alert.alert("Xác nhận hủy đơn hàng", "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.", [{
            text: "Không",
            style: "cancel"
        }, {
            text: "Có, hủy đơn", onPress: async () => {
                setIsCancelling(true);
                try {
                    const response = await orderService.cancelOrder(order.id, { note: "Khách hàng tự hủy đơn." });
                    if (response && response.status === 200) {
                        Alert.alert("Thành công", response.message || "Đơn hàng đã được hủy.");
                        fetchOrderAndRatings();
                    } else {
                        Alert.alert("Lỗi hủy đơn", response?.message || "Không thể hủy đơn hàng.");
                    }
                } catch (err) {
                    Alert.alert("Lỗi hủy đơn", err?.message || "Đã xảy ra lỗi khi cố gắng hủy đơn hàng.");
                } finally {
                    setIsCancelling(false);
                }
            }, style: "destructive",
        },]);
    };

    const handleOpenRatingModal = (productItem) => {
        setSelectedProductToRate(productItem);
        const existingRating = userRatings[productItem.productId];
        if (existingRating) {
            setEditingRateId(existingRating.id);
            setInitialRatingForModal(existingRating.vote);
            setInitialCommentForModal(existingRating.comment);
        } else {
            setEditingRateId(null);
            setInitialRatingForModal(0);
            setInitialCommentForModal('');
        }
        setRatingModalVisible(true);
    };

    const handleSubmitRating = async (productId, vote, comment) => {
        setIsSubmittingRating(true);
        try {
            if (editingRateId) {
                // Delete the old rating first
                const deleteResponse = await productService.deleteRate(editingRateId);
                if (!deleteResponse || deleteResponse.status !== 200) {
                    Alert.alert("Lỗi", "Không thể xóa đánh giá cũ. Vui lòng thử lại.");
                    setIsSubmittingRating(false);
                    return;
                }
            }

            const rateData = { productId, vote, comment };
            const response = await productService.createRate(rateData);

            if (response && response.status === 201) {
                Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá sản phẩm!");
                setRatingModalVisible(false);
                fetchOrderAndRatings(); // Refresh to show updated rating status
            } else {
                Alert.alert("Lỗi", response?.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
            }
        } catch (err) {
            Alert.alert("Lỗi", err?.message || "Đã xảy ra lỗi khi gửi đánh giá.");
        } finally {
            setIsSubmittingRating(false);
            setEditingRateId(null); // Reset editing state
        }
    };

    if (isLoading) {
        return <View className="flex-1 justify-center items-center bg-slate-50"><ActivityIndicator size="large"
            color="#0EA5E9" /></View>;
    }

    if (error) {
        return (<SafeAreaView className="flex-1 justify-center items-center bg-slate-100 p-5">
            <Ionicons name="alert-circle-outline" size={70} color="#F87171" />
            <Text className="text-xl font-semibold text-gray-700 mt-4">Lỗi tải đơn hàng</Text>
            <Text className="text-gray-500 mt-1 text-center mb-3">{error}</Text>
            <TouchableOpacity onPress={fetchOrderAndRatings}
                className="bg-sky-500 px-5 py-2.5 rounded-lg shadow active:bg-sky-600">
                <Text className="text-white font-medium">Thử lại</Text>
            </TouchableOpacity>
        </SafeAreaView>);
    }

    if (!order) {
        return <View className="flex-1 justify-center items-center bg-slate-100"><Text>Không tìm thấy đơn
            hàng.</Text></View>;
    }

    const statusInfo = OrderStatusMapping[order.status] || OrderStatusMapping.default;
    const paymentMethodInfo = PaymentMethodMapping[order.paymentMethod] || PaymentMethodMapping.default;
    const paymentStatusInfo = PaymentStatusMapping[order.paymentStatus] || PaymentStatusMapping.default;
    const createdAtDate = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'N/A';
    const canCancelOrder = order.status === 1 || order.status === 2;
    const orderIsDelivered = statusInfo.isDelivered === true;

    return (<SafeAreaView className="flex-1 bg-slate-100">
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
                <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
                    <Text className="text-lg font-bold text-sky-600">Đơn hàng #{order.id}</Text>
                    <View className={`px-2.5 py-1 rounded-full flex-row items-center ${statusInfo.bg}`}>
                        <MaterialCommunityIcons name={statusInfo.icon} size={16}
                            color={statusInfo.color.replace('text-', '')} />
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
                    <Text
                        className={`flex-1 text-sm font-medium ${paymentStatusInfo.color}`}>{paymentStatusInfo.text}</Text>
                </InfoRow>
                {order.note && <InfoRow icon="note-text-outline" label="Ghi chú" value={order.note} />}
            </View>

            <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Sản phẩm</Text>
                {order.orderProducts?.map(item => (<OrderProductItem
                    key={item.id.toString()}
                    item={item}
                    onRatePress={handleOpenRatingModal}
                    orderStatusIsDelivered={orderIsDelivered}
                    userRating={userRatings[item.productId]}
                />))}
            </View>

            <View className="bg-white m-3 p-4 rounded-lg shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Thanh toán</Text>
                <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-600">Tổng tiền hàng:</Text>
                    <Text
                        className="text-sm text-gray-800 font-medium">{order.totalPrice?.toLocaleString('vi-VN')}₫</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-600">Phí vận chuyển:</Text>
                    <Text className="text-sm text-gray-800 font-medium">0₫</Text>
                </View>
                <View className="border-t border-gray-200 pt-2 mt-1 flex-row justify-between items-center">
                    <Text className="text-base font-bold text-gray-800">Thành tiền:</Text>
                    <Text
                        className="text-xl font-bold text-red-600">{order.totalPrice?.toLocaleString('vi-VN')}₫</Text>
                </View>
            </View>

            {canCancelOrder && (<View className="m-3 mt-4">
                <TouchableOpacity
                    onPress={handleCancelOrder}
                    disabled={isCancelling}
                    className={`py-3.5 rounded-lg shadow ${isCancelling ? 'bg-gray-400' : 'bg-red-500 active:bg-red-600'}`}
                >
                    {isCancelling ? (<ActivityIndicator color="#FFFFFF" />) : (
                        <Text className="text-white text-center text-base font-semibold">Hủy Đơn Hàng</Text>)}
                </TouchableOpacity>
            </View>)}
        </ScrollView>
        <ProductRatingModal
            visible={ratingModalVisible}
            onClose={() => setRatingModalVisible(false)}
            onSubmit={handleSubmitRating}
            productInfo={selectedProductToRate}
            initialRating={initialRatingForModal}
            initialComment={initialCommentForModal}
            isLoading={isSubmittingRating}
        />
    </SafeAreaView>);
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
    },
});

export default OrderDetailScreen;
