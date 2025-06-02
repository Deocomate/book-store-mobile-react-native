// src/screens/cart/CartScreen.jsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

// --- DỮ LIỆU GIẢ ---
// Sử dụng lại hàm generateFakeProducts từ ProductScreen để có dữ liệu sản phẩm
const generateFakeProducts = (count = 5) => { // Tạo ít sản phẩm hơn cho giỏ hàng
    const products = [];
    const bookTitles = [
        "Lập Trình Với NodeJS", "React Native Cho Người Mới Bắt Đầu", "Kiến Trúc Microservices",
        "Thiết Kế Hướng Dữ Liệu", "Giải Thuật Và Cấu Trúc Dữ Liệu",
    ];
    const authors = ["Nguyễn Văn Coder", "Trần Thị Dev", "Lê Minh Engineer", "Phạm Thuật Toán Gia", "Hoàng Hệ Thống"];

    for (let i = 0; i < count; i++) {
        const original_price = Math.floor(Math.random() * 300 + 80) * 1000; // 80k - 380k
        const discount_percent = Math.random() < 0.7 ? Math.random() * 0.30 + 0.05 : 0; // 5-35% discount
        const sale_price = Math.floor(original_price * (1 - discount_percent) / 1000) * 1000;
        products.push({
            product_id: `cartprod_${Date.now()}_${i + 1}`,
            title: bookTitles[i % bookTitles.length] + (count > bookTitles.length ? ` Edition ${Math.floor(i / bookTitles.length) + 1}` : ''),
            author: authors[i % authors.length],
            thumbnail_url: `https://picsum.photos/seed/cartthumb${i + 1}/200/300`,
            sale_price: sale_price,
            original_price: original_price,
            quantity_in_stock: Math.floor(Math.random() * 20) + 1, // Đảm bảo luôn có hàng
        });
    }
    return products;
};

const fakeProductsForCart = generateFakeProducts(3); // Tạo 3 sản phẩm cho giỏ hàng ban đầu

const initialFakeCartItems = fakeProductsForCart.map((product, index) => ({
    id: `cartitem_${product.product_id}`, // ID của mục trong giỏ hàng
    product: product,
    quantity: Math.floor(Math.random() * 2) + 1, // Số lượng từ 1 đến 3
}));
// --- KẾT THÚC DỮ LIỆU GIẢ ---

function CartScreen() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState(initialFakeCartItems);
    const [selectedItems, setSelectedItems] = useState(() => new Set(cartItems.map(item => item.id))); // Chọn tất cả ban đầu

    const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
        if (newQuantity <= 0) { // Nếu số lượng <= 0, xóa sản phẩm
            handleRemoveItem(itemId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId
                    ? { ...item, quantity: Math.min(newQuantity, item.product.quantity_in_stock) } // Giới hạn bởi số lượng tồn kho
                    : item
            )
        );
    }, []);

    const handleRemoveItem = useCallback((itemId) => {
        Alert.alert(
            "Xóa sản phẩm",
            "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    onPress: () => {
                        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
                        setSelectedItems(prevSelected => {
                            const newSelected = new Set(prevSelected);
                            newSelected.delete(itemId);
                            return newSelected;
                        });
                    },
                    style: "destructive"
                }
            ]
        );
    }, []);

    const handleToggleSelectItem = useCallback((itemId) => {
        setSelectedItems(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(itemId)) {
                newSelected.delete(itemId);
            } else {
                newSelected.add(itemId);
            }
            return newSelected;
        });
    }, []);

    const handleToggleSelectAll = () => {
        if (selectedItems.size === cartItems.length) {
            setSelectedItems(new Set()); // Bỏ chọn tất cả
        } else {
            setSelectedItems(new Set(cartItems.map(item => item.id))); // Chọn tất cả
        }
    };

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            if (selectedItems.has(item.id)) {
                return sum + item.product.sale_price * item.quantity;
            }
            return sum;
        }, 0);
    }, [cartItems, selectedItems]);

    const totalSelectedCount = useMemo(() => {
        return cartItems.reduce((count, item) => {
            if (selectedItems.has(item.id)) {
                return count + item.quantity;
            }
            return count;
        }, 0);
    }, [cartItems, selectedItems]);


    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            Alert.alert("Giỏ hàng trống", "Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
            return;
        }
        // Logic điều hướng đến trang thanh toán với các sản phẩm đã chọn
        const itemsToCheckout = cartItems.filter(item => selectedItems.has(item.id));
        console.log("Tiến hành thanh toán với các sản phẩm:", itemsToCheckout);
        router.push({ pathname: '/(app)/checkout', params: { subtotalAmount: subtotal } }); // Truyền tổng tiền tạm thời
    };

    const CartItem = React.memo(({ item, isSelected, onToggleSelect, onUpdateQuantity, onRemove }) => (
        <View className="bg-white p-3 mb-3 rounded-lg shadow flex-row items-center">
            {/* Checkbox */}
            <TouchableOpacity onPress={onToggleSelect} className="p-2 mr-2">
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked-outline" : "checkbox-blank-outline"}
                    size={26}
                    color={isSelected ? "#0EA5E9" : "#6B7280"}
                />
            </TouchableOpacity>

            {/* Product Image */}
            <Image source={{ uri: item.product.thumbnail_url }} className="w-20 h-28 rounded-md mr-3" resizeMode="cover" />

            {/* Product Details */}
            <View className="flex-1 space-y-1">
                <Text className="text-sm font-semibold text-gray-800" numberOfLines={2}>{item.product.title}</Text>
                <Text className="text-xs text-gray-500">Tác giả: {item.product.author}</Text>
                <Text className="text-sm font-bold text-sky-600">{item.product.sale_price.toLocaleString('vi-VN')}₫</Text>
                {item.product.original_price > item.product.sale_price && (
                    <Text className="text-xs text-gray-400 line-through">
                        {item.product.original_price.toLocaleString('vi-VN')}₫
                    </Text>
                )}

                {/* Quantity Selector */}
                <View className="flex-row items-center mt-1">
                    <TouchableOpacity
                        onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 border border-gray-300 rounded-l-md active:bg-gray-100"
                    >
                        <Ionicons name="remove" size={18} color="#4B5563" />
                    </TouchableOpacity>
                    <Text className="px-3 py-1 border-t border-b border-gray-300 text-sm font-medium text-gray-700">
                        {item.quantity}
                    </Text>
                    <TouchableOpacity
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.quantity_in_stock}
                        className={`p-1.5 border border-gray-300 rounded-r-md ${item.quantity >= item.product.quantity_in_stock ? 'bg-gray-100' : 'active:bg-gray-100'}`}
                    >
                        <Ionicons name="add" size={18} color={item.quantity >= item.product.quantity_in_stock ? "#9CA3AF" : "#4B5563"} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Remove Button */}
            <TouchableOpacity onPress={() => onRemove(item.id)} className="p-2 ml-2 self-start">
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
        </View>
    ));


    if (cartItems.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-slate-100 justify-center items-center p-5">
                <MaterialCommunityIcons name="cart-off" size={80} color="#CBD5E1" />
                <Text className="text-xl font-semibold text-gray-500 mt-4">Giỏ hàng của bạn đang trống</Text>
                <Text className="text-gray-400 mt-1 text-center mb-6">
                    Hãy khám phá và thêm những cuốn sách yêu thích vào giỏ nhé!
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(app)/product/')} // Điều hướng đến trang sản phẩm
                    className="bg-sky-500 px-6 py-3 rounded-lg shadow-md active:bg-sky-600"
                >
                    <Text className="text-white font-semibold text-base">Tiếp tục mua sắm</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            {/* Select All / Header Actions */}
            <View className="px-4 py-3 bg-white border-b border-gray-200 flex-row justify-between items-center">
                <TouchableOpacity onPress={handleToggleSelectAll} className="flex-row items-center">
                    <MaterialCommunityIcons
                        name={selectedItems.size === cartItems.length && cartItems.length > 0 ? "checkbox-multiple-marked-outline" : "checkbox-multiple-blank-outline"}
                        size={24}
                        color={selectedItems.size === cartItems.length && cartItems.length > 0 ? "#0EA5E9" : "#6B7280"}
                    />
                    <Text className="ml-2 text-sm text-gray-700">
                        {selectedItems.size === cartItems.length && cartItems.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả"} ({cartItems.length} sản phẩm)
                    </Text>
                </TouchableOpacity>
                {/* Có thể thêm nút "Xóa mục đã chọn" ở đây nếu cần */}
            </View>

            <FlatList
                data={cartItems}
                renderItem={({ item }) => (
                    <CartItem
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onToggleSelect={() => handleToggleSelectItem(item.id)}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 100 }} // Padding cho bottom bar
                showsVerticalScrollIndicator={false}
            />

            {/* Bottom Summary and Checkout Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-top">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Tạm tính ({totalSelectedCount} sản phẩm):</Text>
                    <Text className="text-lg font-bold text-sky-600">
                        {subtotal.toLocaleString('vi-VN')}₫
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleCheckout}
                    disabled={selectedItems.size === 0}
                    className={`py-3.5 rounded-lg shadow ${selectedItems.size > 0 ? 'bg-sky-500 active:bg-sky-600' : 'bg-gray-300'}`}
                >
                    <Text className="text-white text-center text-base font-semibold">
                        Tiến hành thanh toán
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Thêm shadow-top vào tailwind.config.js nếu chưa có, hoặc sử dụng StyleSheet
// Ví dụ cho StyleSheet nếu không tùy chỉnh Tailwind:
// const styles = StyleSheet.create({
//     shadowTop: {
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: -3, // Shadow ở phía trên
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//         elevation: 5,
//     }
// });
// và dùng <View style={[styles.shadowTop, {position: 'absolute', ...}]}>

export default CartScreen;