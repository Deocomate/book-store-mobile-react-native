// src/screens/cart/CartScreen.jsx
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView, // For potential top shadow if Tailwind custom class isn't used
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const CartItem = ({ item, isSelected, onToggleSelect, onUpdateQuantity, onRemove, isUpdatingCart }) => {

    const productDetail = item.productDetails;

    if (!productDetail) {
        // Fallback if productDetails couldn't be fetched for some reason
        return (
            <View className="bg-white p-3 mb-3 rounded-lg shadow flex-row items-center">
                <Text className="text-red-500">Thông tin sản phẩm ID {item.productId} không khả dụng.</Text>
                <TouchableOpacity onPress={() => onRemove(item.id, item.productId)} className="p-2 ml-auto self-start">
                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
            </View>
        );
    }
    const currentPrice = productDetail.discount || productDetail.price || 0;
    const originalPrice = productDetail.price || 0;
    const stockQuantity = productDetail.quantity || 0;

    return (
        <View className="bg-white p-3 mb-3 rounded-lg shadow flex-row items-center">
            {/* Checkbox */}
            <TouchableOpacity onPress={() => onToggleSelect(item.id)} className="p-2 mr-2" disabled={isUpdatingCart}>
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked-outline" : "checkbox-blank-outline"}
                    size={26}
                    color={isSelected ? "#0EA5E9" : (isUpdatingCart ? "#D1D5DB" : "#6B7280")}
                />
            </TouchableOpacity>

            {/* Product Image */}
            <Image
                source={{ uri: productDetail.thumbnail }}
                className="w-20 h-28 rounded-md mr-3"
                resizeMode="cover"
                onError={() => console.log(`Failed to load image for product ${productDetail.title}`)}
            />

            {/* Product Details */}
            <View className="flex-1 space-y-1">
                <Text className="text-sm font-semibold text-gray-800" numberOfLines={2}>{productDetail.title}</Text>
                <Text className="text-xs text-gray-500">Tác giả: {productDetail.author || 'N/A'}</Text>
                <Text className="text-sm font-bold text-sky-600">{currentPrice.toLocaleString('vi-VN')}₫</Text>
                {originalPrice > currentPrice && (
                    <Text className="text-xs text-gray-400 line-through">
                        {originalPrice.toLocaleString('vi-VN')}₫
                    </Text>
                )}

                {/* Quantity Selector */}
                <View className="flex-row items-center mt-1">
                    <TouchableOpacity
                        onPress={() => onUpdateQuantity(item.id, item.productId, -1)}
                        disabled={isUpdatingCart || item.quantity <= 1}
                        className={`p-1.5 border border-gray-300 rounded-l-md ${(isUpdatingCart || item.quantity <= 1) ? 'bg-gray-100' : 'active:bg-gray-100'}`}
                    >
                        <Ionicons name="remove" size={18} color={(isUpdatingCart || item.quantity <= 1) ? "#9CA3AF" : "#4B5563"} />
                    </TouchableOpacity>
                    <Text className="px-3 py-1 border-t border-b border-gray-300 text-sm font-medium text-gray-700">
                        {item.quantity}
                    </Text>
                    <TouchableOpacity
                        onPress={() => onUpdateQuantity(item.id, item.productId, 1)}
                        disabled={isUpdatingCart || item.quantity >= stockQuantity}
                        className={`p-1.5 border border-gray-300 rounded-r-md ${(isUpdatingCart || item.quantity >= stockQuantity) ? 'bg-gray-100' : 'active:bg-gray-100'}`}
                    >
                        <Ionicons name="add" size={18} color={(isUpdatingCart || item.quantity >= stockQuantity) ? "#9CA3AF" : "#4B5563"} />
                    </TouchableOpacity>
                </View>
                {item.quantity >= stockQuantity && stockQuantity > 0 && (
                    <Text className="text-xs text-red-500 mt-0.5">Đã đạt tối đa tồn kho</Text>
                )}
                {stockQuantity === 0 && (
                    <Text className="text-xs text-red-500 mt-0.5 font-semibold">HẾT HÀNG</Text>
                )}
            </View>

            {/* Remove Button */}
            <TouchableOpacity onPress={() => onRemove(item.id, item.productId)} className="p-2 ml-2 self-start" disabled={isUpdatingCart}>
                <Ionicons name="trash-outline" size={22} color={isUpdatingCart ? "#D1D5DB" : "#EF4444"} />
            </TouchableOpacity>
        </View>
    )
};


function CartScreen() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const {
        cart, // This is CartResponse { id, userId, cartProducts: List<CartProductResponseWithDetails> }
        isLoading: cartLoading, // Renamed to avoid conflict with local isLoading
        error: cartError,       // Renamed
        fetchCart,
        updateCartItemQuantity,
        removeProductFromCartByProductId,
    } = useCart();

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUpdatingCartItem, setIsUpdatingCartItem] = useState(false); // General loading state for cart item operations

    // Effect to initialize/update selected items when cart changes
    useEffect(() => {
        if (cart && cart.cartProducts) {
            // Select all items by default when cart loads or changes
            // You can change this logic if you prefer items to be unselected by default
            const newSelectedItems = new Set(cart.cartProducts.map(item => item.id));
            setSelectedItems(newSelectedItems);
        } else {
            setSelectedItems(new Set()); // Clear selection if cart is null or empty
        }
    }, [cart]);


    const handleUpdateQuantity = useCallback(async (cartProductId, productId, newQuantity) => {
        // if (newQuantity <= 0) {
        //     handleRemoveItem(cartProductId, productId); // cartProductId is the cart item ID, productId is the product's actual ID
        //     return;
        // }
        setIsUpdatingCartItem(true);
        await updateCartItemQuantity(productId, newQuantity);
        // fetchCart(true) is called within updateCartItemQuantity in CartContext
        setIsUpdatingCartItem(false);
    }, [updateCartItemQuantity, removeProductFromCartByProductId]);


    const handleRemoveItem = useCallback(async (cartProductId, productId) => {
        Alert.alert(
            "Xóa sản phẩm",
            "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    onPress: async () => {
                        setIsUpdatingCartItem(true);
                        await removeProductFromCartByProductId(productId);
                        // fetchCart(true) is called within removeProductFromCartByProductId
                        // Local state 'selectedItems' will be updated by the useEffect hook watching 'cart'
                        // Or, more imperatively:
                        setSelectedItems(prevSelected => {
                            const newSelected = new Set(prevSelected);
                            newSelected.delete(cartProductId); // cartProductId is item.id
                            return newSelected;
                        });
                        setIsUpdatingCartItem(false);
                    },
                    style: "destructive"
                }
            ]
        );
    }, [removeProductFromCartByProductId]);

    const handleToggleSelectItem = useCallback((cartProductId) => {
        setSelectedItems(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(cartProductId)) {
                newSelected.delete(cartProductId);
            } else {
                newSelected.add(cartProductId);
            }
            return newSelected;
        });
    }, []);

    const handleToggleSelectAll = () => {
        if (!cart || !cart.cartProducts || cart.cartProducts.length === 0) return;
        if (selectedItems.size === cart.cartProducts.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cart.cartProducts.map(item => item.id)));
        }
    };

    const subtotal = useMemo(() => {
        if (!cart || !cart.cartProducts) return 0;
        return cart.cartProducts.reduce((sum, item) => {
            if (selectedItems.has(item.id) && item.productDetails) {
                const price = item.productDetails.discount || item.productDetails.price || 0;
                return sum + price * item.quantity;
            }
            return sum;
        }, 0);
    }, [cart, selectedItems]);

    const totalSelectedCount = useMemo(() => {
        if (!cart || !cart.cartProducts) return 0;
        return cart.cartProducts.reduce((count, item) => {
            if (selectedItems.has(item.id)) {
                return count + item.quantity;
            }
            return count;
        }, 0);
    }, [cart, selectedItems]);

    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            Alert.alert("Giỏ hàng trống", "Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
            return;
        }

        const itemsToCheckout = cart.cartProducts
            .filter(item => selectedItems.has(item.id) && item.productDetails && item.productDetails.quantity > 0) // Only checkout available items
            .map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                productName: item.productDetails.title,
                price: item.productDetails.discount || item.productDetails.price, // price per unit at checkout
                thumbnail: item.productDetails.thumbnail
            }));

        if (itemsToCheckout.length === 0) {
            Alert.alert("Sản phẩm không hợp lệ", "Các sản phẩm bạn chọn không còn hàng hoặc đã hết. Vui lòng kiểm tra lại giỏ hàng.");
            return;
        }

        console.log("Tiến hành thanh toán với các sản phẩm:", itemsToCheckout);


        router.push({
            pathname: '/(app)/checkout',
            params: {
                checkoutItems: JSON.stringify(itemsToCheckout), // Stringify for navigation
                subtotalAmount: subtotal,
            }
        });
    };

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchCart(true); // Force refresh
        setIsRefreshing(false);
    }, [fetchCart]);


    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-slate-100 justify-center items-center p-5">
                <Ionicons name="lock-closed-outline" size={80} color="#CBD5E1" />
                <Text className="text-xl font-semibold text-gray-500 mt-4">Vui lòng đăng nhập</Text>
                <Text className="text-gray-400 mt-1 text-center mb-6">
                    Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình.
                </Text>
                <TouchableOpacity
                    onPress={() => router.replace('/(auth)/login')}
                    className="bg-sky-500 px-6 py-3 rounded-lg shadow-md active:bg-sky-600"
                >
                    <Text className="text-white font-semibold text-base">Đăng Nhập</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (cartLoading && (!cart || isRefreshing)) { // Show loading if cart data is not yet available OR refreshing
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-100">
                <ActivityIndicator size="large" color="#0EA5E9" />
            </SafeAreaView>
        );
    }

    if (cartError) {
        return (
            <SafeAreaView className="flex-1 bg-slate-100 justify-center items-center p-5">
                <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#EF4444" />
                <Text className="text-xl font-semibold text-red-500 mt-4">Lỗi tải giỏ hàng</Text>
                <Text className="text-gray-500 mt-1 text-center mb-6">{cartError}</Text>
                <TouchableOpacity
                    onPress={onRefresh}
                    className="bg-sky-500 px-6 py-3 rounded-lg shadow-md active:bg-sky-600"
                >
                    <Text className="text-white font-semibold text-base">Thử lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!cart || !cart.cartProducts || cart.cartProducts.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-slate-100 justify-center items-center p-5">
                <MaterialCommunityIcons name="cart-off" size={80} color="#CBD5E1" />
                <Text className="text-xl font-semibold text-gray-500 mt-4">Giỏ hàng của bạn đang trống</Text>
                <Text className="text-gray-400 mt-1 text-center mb-6">
                    Hãy khám phá và thêm những cuốn sách yêu thích vào giỏ nhé!
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(app)/product/')}
                    className="bg-sky-500 px-6 py-3 rounded-lg shadow-md active:bg-sky-600"
                >
                    <Text className="text-white font-semibold text-base">Tiếp tục mua sắm</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <View className="px-4 py-3 bg-white border-b border-gray-200 flex-row justify-between items-center">
                <TouchableOpacity onPress={handleToggleSelectAll} className="flex-row items-center" disabled={isUpdatingCartItem}>
                    <MaterialCommunityIcons
                        name={selectedItems.size === cart.cartProducts.length && cart.cartProducts.length > 0 ? "checkbox-multiple-marked-outline" : "checkbox-multiple-blank-outline"}
                        size={24}
                        color={isUpdatingCartItem ? "#D1D5DB" : (selectedItems.size === cart.cartProducts.length && cart.cartProducts.length > 0 ? "#0EA5E9" : "#6B7280")}
                    />
                    <Text className={`ml-2 text-sm ${isUpdatingCartItem ? "text-gray-400" : "text-gray-700"}`}>
                        {selectedItems.size === cart.cartProducts.length && cart.cartProducts.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả"} ({cart.cartProducts.length} sản phẩm)
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={cart.cartProducts}
                renderItem={({ item }) => (
                    <CartItem
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onToggleSelect={handleToggleSelectItem}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                        isUpdatingCart={isUpdatingCartItem}
                    />
                )}
                keyExtractor={item => item.id.toString()} // cartProduct.id is unique
                contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#0EA5E9"]} />
                }
            />

            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-top-md">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Tạm tính ({totalSelectedCount} sản phẩm):</Text>
                    <Text className="text-lg font-bold text-sky-600">
                        {subtotal.toLocaleString('vi-VN')}₫
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleCheckout}
                    disabled={selectedItems.size === 0 || isUpdatingCartItem || cartLoading}
                    className={`py-3.5 rounded-lg shadow ${(selectedItems.size > 0 && !isUpdatingCartItem && !cartLoading) ? 'bg-sky-500 active:bg-sky-600' : 'bg-gray-300'}`}
                >
                    {(isUpdatingCartItem || cartLoading) ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-white text-center text-base font-semibold">
                            Tiến hành thanh toán
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default CartScreen;