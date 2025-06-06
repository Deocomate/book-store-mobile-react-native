
import { useCart } from '@/contexts/CartContext'; // Import useCart
import { productService } from '@/services'; // Import productService
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// --- Các component UI phụ trợ (không thay đổi) ---
const StarRating = ({ rating, size = 16, color = "#FFC107", reviewCount = 0, showText = true }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.4;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <View className="flex-row items-center">
            {[...Array(fullStars)].map((_, i) => <FontAwesome key={`full_${i}`} name="star" size={size} color={color} />)}
            {halfStar && <FontAwesome name="star-half-empty" size={size} color={color} />}
            {[...Array(emptyStars)].map((_, i) => <FontAwesome key={`empty_${i}`} name="star-o" size={size} color={color} />)}
            {showText && <Text className="text-sm text-gray-600 ml-2">{rating ? rating.toFixed(1) : 'Mới'} {reviewCount > 0 ? `(${reviewCount} đánh giá)` : '(chưa có đánh giá)'}</Text>}
        </View>
    );
};

const InfoRow = ({ label, value }) => (
    <View className="flex-row py-1.5">
        <Text className="w-2/5 text-sm text-gray-500">{label}:</Text>
        <Text className="flex-1 text-sm text-gray-800 font-medium">{value || 'N/A'}</Text>
    </View>
);

const ReviewItem = ({ review }) => {
    const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A';
    return (
        <View className="py-3 border-b border-gray-200">
            <View className="flex-row justify-between items-center mb-1">
                <Text className="font-semibold text-gray-700">{review.username}</Text>
                <StarRating rating={review.vote} size={14} showText={false} />
            </View>
            <Text className="text-xs text-gray-500 mb-1.5">{reviewDate}</Text>
            <Text className="text-gray-700 leading-relaxed">{review.comment}</Text>
        </View>
    );
};

const { width: screenWidth } = Dimensions.get('window');

// --- Component chính ProductDetailScreen ---
function ProductDetailScreen({ id: productId }) {
    const router = useRouter();
    const { addProductToCart, isLoading: isAddingToCart } = useCart(); // Lấy hàm và trạng thái từ CartContext

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1); // Thêm state cho số lượng sản phẩm

    const [categoryNames, setCategoryNames] = useState({});

    const fetchProductDetails = useCallback(async () => {
        if (!productId) {
            setError("Không có ID sản phẩm.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch product details
            const productResponse = await productService.getProductById(productId);

            console.log("productResponse: ", productResponse);

            if (productResponse && productResponse.status === 200 && productResponse.result) {
                setProduct(productResponse.result);
                setQuantity(1); // Reset quantity to 1 when a new product is loaded

                // 2. Fetch category names (if product has categories)
                if (productResponse.result.categories && productResponse.result.categories.length > 0) {
                    const catNameMap = {};
                    try {
                        const allCategoriesResponse = await productService.getProductCategories();
                        if (allCategoriesResponse && allCategoriesResponse.status === 200 && allCategoriesResponse.result) {
                            allCategoriesResponse.result.forEach(cat => {
                                catNameMap[cat.id] = cat.name;
                            });
                            setCategoryNames(catNameMap);
                        }
                    } catch (catErr) {
                        console.warn("Could not fetch category names:", catErr.message);
                    }
                }

                // 3. Fetch product reviews (first few reviews)
                const reviewsResponse = await productService.getRatesByProductId(productId, 1, 5); // Fetch first 5 reviews
                if (reviewsResponse && reviewsResponse.status === 200 && reviewsResponse.result && reviewsResponse.result.data) {
                    console.log("reviewResponse: ", reviewsResponse);
                    setReviews(reviewsResponse.result.data);
                }

            } else {
                throw new Error(productResponse?.message || "Không tìm thấy sản phẩm.");
            }
        } catch (err) {
            console.error("Error fetching product details:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    // Tính toán phần trăm giảm giá
    const discountPercent = useMemo(() => {
        if (!product || !product.price || !product.discount || product.price <= product.discount) return 0;
        // product.discountPercent đã được backend tính sẵn, sử dụng nó nếu có
        return product.discountPercent || Math.round(((product.price - product.discount) / product.price) * 100);
    }, [product]);

    // Hàm tăng số lượng
    const increaseQuantity = useCallback(() => {
        if (product && quantity < product.quantity) { // Giới hạn số lượng bằng số lượng tồn kho
            setQuantity(prev => prev + 1);
        }
    }, [quantity, product]);

    // Hàm giảm số lượng
    const decreaseQuantity = useCallback(() => {
        if (quantity > 1) { // Đảm bảo số lượng không nhỏ hơn 1
            setQuantity(prev => prev - 1);
        }
    }, [quantity]);

    // Hàm thêm vào giỏ hàng
    const handleAddToCart = async () => {
        if (!product) return;
        if (product.quantity === 0) {
            Alert.alert("Hết hàng", "Sản phẩm này tạm thời hết hàng.");
            return;
        }
        if (quantity > product.quantity) {
            Alert.alert("Không đủ hàng", `Chỉ còn ${product.quantity} sản phẩm trong kho. Vui lòng giảm số lượng.`);
            return;
        }

        const success = await addProductToCart(product.id, quantity); // Gọi hàm từ CartContext
        if (success) {
            Alert.alert("Thành công", `Đã thêm ${quantity} sản phẩm "${product.title}" vào giỏ hàng!`);
            // Optionally, refresh product details if quantity in stock needs to be updated immediately
            // Or rely on CartContext to handle fetching and UI update for cart icon.
            setQuantity(1); // Reset số lượng về 1 sau khi thêm vào giỏ
        } else {
            Alert.alert("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
        }
    };

    // Hàm render item cho carousel ảnh
    const renderImageCarousel = ({ item }) => (
        <Image
            source={{ uri: item }} // API trả về URL đầy đủ
            style={{ width: screenWidth, height: 400 }} // Đảm bảo width bằng chiều rộng màn hình
            resizeMode="cover" // Chế độ hiển thị ảnh
            placeholder={{ uri: 'https://via.placeholder.com/600x800/e0e0e0/999999?text=Book+Image' }}
            transition={300}
        />
    );

    // Xử lý sự kiện scroll để cập nhật chỉ mục ảnh đang hiển thị
    const onScrollImage = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveImageIndex(Math.round(index));
    };

    // Điều hướng đến màn hình xem tất cả đánh giá
    const handleViewAllReviews = () => {
        router.push({
            pathname: '/(app)/product/reviews',
            params: { productId: product.id }
        });
    };

    // --- Render Loading, Error, hoặc Nội dung chính ---
    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0EA5E9" />
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-100 p-5">
                <Stack.Screen options={{ title: 'Lỗi' }} />
                <Ionicons name="alert-circle-outline" size={70} color="#F87171" />
                <Text className="text-xl font-semibold text-gray-700 mt-4">
                    {error ? "Lỗi tải sản phẩm" : "Không tìm thấy sản phẩm"}
                </Text>
                <Text className="text-gray-500 mt-1 text-center mb-3">
                    {error || "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
                </Text>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/product/')}
                    className="mt-6 bg-sky-500 px-5 py-2.5 rounded-lg shadow active:bg-sky-600"
                >
                    <Text className="text-white font-medium">Quay lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // `product.discount` là giá bán (sale_price từ DB)
    // `product.price` là giá gốc (original_price từ DB)
    const productImages = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.thumbnail];
    const isOutOfStock = product.quantity === 0;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="h-[400px] bg-slate-100">
                    <FlatList
                        data={productImages}
                        renderItem={renderImageCarousel}
                        keyExtractor={(item, index) => `img_${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScrollImage}
                        scrollEventThrottle={16}
                    />
                    {productImages.length > 1 && (
                        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center items-center space-x-2">
                            {productImages.map((_, index) => (
                                <View
                                    key={`dot_${index}`}
                                    className={`h-2 w-2 rounded-full ${index === activeImageIndex ? 'bg-sky-500' : 'bg-gray-400'}`}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View className="p-4">
                    <Text className="text-2xl font-bold text-gray-800 leading-tight">{product.title}</Text>
                    <Text className="text-base text-gray-600 mt-1">Tác giả: {product.author}</Text>

                    <View className="mt-3 flex-row items-end space-x-3">
                        <Text className="text-3xl font-bold text-sky-600">
                            {product.discount?.toLocaleString('vi-VN')}₫
                        </Text>
                        {discountPercent > 0 && (
                            <Text className="text-base text-gray-400 line-through">
                                {product.price?.toLocaleString('vi-VN')}₫
                            </Text>
                        )}
                        {discountPercent > 0 && (
                            <View className="bg-red-100 px-2 py-0.5 rounded-md border border-red-300">
                                <Text className="text-red-600 text-xs font-semibold">GIẢM {Math.round(discountPercent)}%</Text>
                            </View>
                        )}
                    </View>

                    <View className="mt-3">
                        <StarRating rating={product.averageRate} reviewCount={reviews.length} />
                    </View>

                    <Text className={`mt-3 text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                        {isOutOfStock ? "Tạm hết hàng" : `Còn hàng (${product.quantity} sản phẩm)`}
                    </Text>
                </View>

                <View className="h-2 bg-slate-100 my-3" />

                <View className="p-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Thông tin chi tiết</Text>
                    <View className="space-y-1.5">
                        <InfoRow label="Nhà xuất bản" value={product.publisher} />
                        <InfoRow label="Năm xuất bản" value={product.publicationYear?.toString()} />
                        <InfoRow label="Số trang" value={product.pageSize?.toString()} />
                        <InfoRow label="Hình thức bìa" value={product.form} />
                        <InfoRow label="Kích thước" value={product.packageSize?.toString() + ' cm'} />
                        <InfoRow
                            label="Danh mục"
                            value={product.categories?.map(catId => categoryNames[catId] || `ID ${catId}`).join(', ') || 'N/A'}
                        />
                    </View>
                </View>

                <View className="h-2 bg-slate-100 my-3" />

                <View className="p-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm</Text>
                    <Text className="text-base text-gray-700 leading-relaxed text-justify">
                        {product.description}
                    </Text>
                </View>

                <View className="h-2 bg-slate-100 my-3" />
                <View className="p-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-semibold text-gray-800">Đánh giá sản phẩm ({reviews.length})</Text>
                        {reviews.length > 0 && (
                            <TouchableOpacity onPress={handleViewAllReviews}>
                                <Text className="text-sm text-sky-600 font-medium">Xem tất cả</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {reviews.length > 0 ? (
                        reviews.map(review => <ReviewItem key={review.id.toString()} review={review} />)
                    ) : (
                        <Text className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</Text>
                    )}
                </View>

            </ScrollView>

            <View className="border-t border-gray-200 p-3 bg-white flex-row items-center space-x-2">
                <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
                    <TouchableOpacity
                        onPress={decreaseQuantity}
                        disabled={quantity <= 1 || isOutOfStock || isAddingToCart}
                        className={`p-3 ${quantity <= 1 || isOutOfStock || isAddingToCart ? 'bg-gray-100' : 'active:bg-gray-200'}`}
                    >
                        <Ionicons name="remove" size={20} color={quantity <= 1 || isOutOfStock ? "#9CA3AF" : "#4B5563"} />
                    </TouchableOpacity>
                    <Text className="px-4 py-3 text-base font-semibold text-gray-800">
                        {quantity}
                    </Text>
                    <TouchableOpacity
                        onPress={increaseQuantity}
                        disabled={isOutOfStock || quantity >= product.quantity || isAddingToCart}
                        className={`p-3 ${isOutOfStock || quantity >= product.quantity || isAddingToCart ? 'bg-gray-100' : 'active:bg-gray-200'}`}
                    >
                        <Ionicons name="add" size={20} color={isOutOfStock || quantity >= product.quantity ? "#9CA3AF" : "#4B5563"} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart}
                    className={`ms-3 flex-1 py-3.5 rounded-lg shadow ${isOutOfStock || isAddingToCart ? 'bg-gray-400' : 'bg-sky-500 active:bg-sky-600'}`}
                >
                    {isAddingToCart ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text className="text-white text-center text-base font-semibold">
                            {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default ProductDetailScreen;