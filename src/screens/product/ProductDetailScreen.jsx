// src/screens/product/ProductDetailScreen.jsx
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Lấy lại hàm generateFakeProducts và StarRating, hoặc import nếu bạn tách ra file riêng
// --- DỮ LIỆU GIẢ ---
const generateFakeProducts = (count = 20) => {
    const products = [];
    const bookTitles = [
        "Lập Trình Với NodeJS", "React Native Cho Người Mới Bắt Đầu", "Kiến Trúc Microservices",
        "Thiết Kế Hướng Dữ Liệu", "Giải Thuật Và Cấu Trúc Dữ Liệu", "Clean Code Handbook",
        "Bí Quyết Trở Thành Fullstack Developer", "Học Docker Trong 24 Giờ", "Kubernetes Nâng Cao",
        "Python Cho Khoa Học Dữ Liệu"
    ];
    const authors = [
        "Nguyễn Văn Coder", "Trần Thị Dev", "Lê Minh Engineer", "Phạm Thuật Toán Gia",
        "Hoàng Hệ Thống", "Mai Kiến Trúc Sư", "Bùi Chuyên Gia", "Đỗ Lập Trình Viên"
    ];
    const categories = ["Công nghệ", "Lập trình", "Phát triển Web", "Mobile App", "Dữ liệu"];

    for (let i = 0; i < count; i++) {
        const original_price = Math.floor(Math.random() * 400 + 100) * 1000; // 100k - 500k
        const discount_percent = Math.random() < 0.6 ? Math.random() * 0.35 + 0.05 : 0; // 5-40% discount, 60% chance
        const sale_price = Math.floor(original_price * (1 - discount_percent) / 1000) * 1000;
        products.push({
            id: products.length, // Đảm bảo ID là duy nhất khi generate
            title: bookTitles[i % bookTitles.length] + (count > bookTitles.length ? ` Vol. ${Math.floor(i / bookTitles.length) + 1}` : ''),
            author: authors[i % authors.length],
            thumbnail_url: `https://picsum.photos/seed/prodthumb${i + 1}/270/400`,
            sale_price: sale_price,
            original_price: original_price,
            average_rating: parseFloat((Math.random() * 1.8 + 3.2).toFixed(1)), // Rating 3.2 - 5.0
            quantity_in_stock: Math.floor(Math.random() * 50) + 5,
            category: categories[i % categories.length],
            description: "Một cuốn sách tuyệt vời dành cho những ai đam mê khám phá và học hỏi. Với nội dung sâu sắc, trình bày rõ ràng và nhiều ví dụ minh họa thực tế, cuốn sách này sẽ là người bạn đồng hành không thể thiếu trên con đường chinh phục tri thức của bạn. Cuốn sách đi sâu vào các khái niệm cốt lõi, cung cấp các kỹ thuật tiên tiến và chia sẻ những kinh nghiệm quý báu từ các chuyên gia hàng đầu trong ngành. Hãy sẵn sàng để mở rộng tầm nhìn và nâng cao kỹ năng của bạn lên một tầm cao mới!",
            images: [
                `https://picsum.photos/seed/prodimg${i + 1}_1/600/800`,
                `https://picsum.photos/seed/prodimg${i + 1}_2/600/800`,
                `https://picsum.photos/seed/prodimg${i + 1}_3/600/800`,
            ],
            publisher: "NXB Tri Thức Việt",
            publication_year: 2023 + Math.floor(i / 5) % 3,
            page_count: Math.floor(Math.random() * 300) + 150,
            form_description: Math.random() > 0.5 ? "Bìa mềm" : "Bìa cứng",
            package_size_info: `${Math.floor(Math.random() * 5) + 15} x ${Math.floor(Math.random() * 5) + 20} x ${Math.floor(Math.random() * 3) + 1} cm`
        });
    }
    return products;
};
const ALL_PRODUCTS_DETAIL_CONTEXT = generateFakeProducts(30);

const StarRating = ({ rating, size = 16, color = "#FFC107", showText = true }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.4;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <View className="flex-row items-center">
            {[...Array(fullStars)].map((_, i) => <FontAwesome key={`full_${i}`} name="star" size={size} color={color} />)}
            {halfStar && <FontAwesome name="star-half-empty" size={size} color={color} />}
            {[...Array(emptyStars)].map((_, i) => <FontAwesome key={`empty_${i}`} name="star-o" size={size} color={color} />)}
            {showText && <Text className="text-sm text-gray-600 ml-2">{rating.toFixed(1)} ({Math.floor(Math.random() * 100) + 5} đánh giá)</Text>}
        </View>
    );
};

const { width: screenWidth } = Dimensions.get('window');

function ProductDetailScreen({ id }) {
    console.log(ALL_PRODUCTS_DETAIL_CONTEXT, id);

    const router = useRouter();
    const params = useLocalSearchParams();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        // Giả lập fetch product data
        setIsLoading(true);
        const foundProduct = ALL_PRODUCTS_DETAIL_CONTEXT.find(p => p.id == id);
        setTimeout(() => { // Giả lập độ trễ mạng
            setProduct(foundProduct);
            setIsLoading(false);
        }, 500);
    }, [id]);

    const discountPercent = useMemo(() => {
        if (!product || product.original_price <= product.sale_price) return 0;
        return Math.round(((product.original_price - product.sale_price) / product.original_price) * 100);
    }, [product]);

    const handleAddToCart = () => {
        if (!product) return;
        // Logic thêm vào giỏ hàng (chưa kết nối API)
        Alert.alert("Thêm vào giỏ hàng", `${quantity} x ${product.title} đã được thêm vào giỏ hàng (giả lập).`);
    };

    const renderImageCarousel = ({ item }) => (
        <Image
            source={{ uri: item }}
            className="w-[${screenWidth}] h-[400px]" // Sử dụng width của màn hình
            resizeMode="contain"
        />
    );

    const onScrollImage = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveImageIndex(Math.round(index));
    };


    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0EA5E9" />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-100 p-5">
                <Ionicons name="alert-circle-outline" size={70} color="#F87171" />
                <Text className="text-xl font-semibold text-gray-700 mt-4">Không tìm thấy sản phẩm</Text>
                <Text className="text-gray-500 mt-1 text-center">
                    Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-sky-500 px-5 py-2.5 rounded-lg">
                    <Text className="text-white font-medium">Quay lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View className="h-[400px] bg-slate-100">
                    <FlatList
                        data={product.images}
                        renderItem={renderImageCarousel}
                        keyExtractor={(item, index) => `img_${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScrollImage}
                        scrollEventThrottle={16} // Quan trọng cho onScroll
                    />
                    {product.images.length > 1 && (
                        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center items-center space-x-2">
                            {product.images.map((_, index) => (
                                <View
                                    key={`dot_${index}`}
                                    className={`h-2 w-2 rounded-full ${index === activeImageIndex ? 'bg-sky-500' : 'bg-gray-400'}`}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View className="p-4">
                    <Text className="text-2xl font-bold text-gray-800 leading-tight">{product.title}</Text>
                    <Text className="text-base text-gray-600 mt-1">Tác giả: {product.author}</Text>

                    {/* Price & Discount */}
                    <View className="mt-3 flex-row items-end space-x-3">
                        <Text className="text-3xl font-bold text-sky-600">
                            {product.sale_price.toLocaleString('vi-VN')}₫
                        </Text>
                        {discountPercent > 0 && (
                            <Text className="text-base text-gray-400 line-through">
                                {product.original_price.toLocaleString('vi-VN')}₫
                            </Text>
                        )}
                        {discountPercent > 0 && (
                            <View className="bg-red-100 px-2 py-0.5 rounded-md border border-red-300">
                                <Text className="text-red-600 text-xs font-semibold">GIẢM {discountPercent}%</Text>
                            </View>
                        )}
                    </View>

                    {/* Rating */}
                    <View className="mt-3">
                        <StarRating rating={product.average_rating} />
                    </View>

                    {/* Stock Status */}
                    <Text className={`mt-3 text-sm font-medium ${product.quantity_in_stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.quantity_in_stock > 0 ? `Còn hàng (${product.quantity_in_stock} sản phẩm)` : "Tạm hết hàng"}
                    </Text>
                </View>

                {/* Divider */}
                <View className="h-2 bg-slate-100 my-3" />

                {/* Product Details Section */}
                <View className="p-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Thông tin chi tiết</Text>
                    <View className="space-y-1.5">
                        <InfoRow label="Nhà xuất bản" value={product.publisher} />
                        <InfoRow label="Năm xuất bản" value={product.publication_year.toString()} />
                        <InfoRow label="Số trang" value={product.page_count.toString()} />
                        <InfoRow label="Hình thức bìa" value={product.form_description} />
                        <InfoRow label="Kích thước" value={product.package_size_info} />
                        <InfoRow label="Danh mục" value={product.category} />
                    </View>
                </View>

                {/* Divider */}
                <View className="h-2 bg-slate-100 my-3" />

                {/* Description */}
                <View className="p-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm</Text>
                    <Text className="text-base text-gray-700 leading-relaxed text-justify">
                        {product.description}
                    </Text>
                </View>

                {/* TODO: Customer Reviews Section */}
                {/* TODO: Related Products Section */}

            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="border-t border-gray-200 p-3 bg-white flex-row items-center space-x-3">
                {/* Quantity Selector - Tạm thời ẩn, có thể thêm sau này khi tích hợp giỏ hàng */}
                {/* <View className="flex-row items-center border border-gray-300 rounded-md">
                    <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} className="p-2.5">
                        <Ionicons name="remove" size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text className="px-3 text-base font-medium text-gray-700">{quantity}</Text>
                    <TouchableOpacity onPress={() => setQuantity(q => Math.min(product.quantity_in_stock || 1, q + 1))} className="p-2.5">
                        <Ionicons name="add" size={20} color="#374151" />
                    </TouchableOpacity>
                </View> */}
                <TouchableOpacity
                    onPress={() => Alert.alert("Tính năng đang phát triển", "Chat với người bán sẽ sớm được cập nhật.")}
                    className="p-3 border border-sky-500 rounded-lg"
                >
                    <Ionicons name="chatbubbles-outline" size={24} color="#0EA5E9" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleAddToCart}
                    disabled={product.quantity_in_stock === 0}
                    className={`flex-1 py-3.5 rounded-lg shadow ${product.quantity_in_stock > 0 ? 'bg-sky-500 active:bg-sky-600' : 'bg-gray-400'}`}
                >
                    <Text className="text-white text-center text-base font-semibold">
                        {product.quantity_in_stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const InfoRow = ({ label, value }) => (
    <View className="flex-row">
        <Text className="w-1/3 text-sm text-gray-500">{label}:</Text>
        <Text className="flex-1 text-sm text-gray-800 font-medium">{value}</Text>
    </View>
);

export default ProductDetailScreen;