// src/screens/product/ProductScreen.jsx
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- DỮ LIỆU GIẢ --- (Tương tự HomeScreen, nhưng có thể thêm các trường khác nếu cần)
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
            id: products.length === 0 ? 1 : products[products.length - 1].id + 1,
            title: bookTitles[i % bookTitles.length] + (count > bookTitles.length ? ` Vol. ${Math.floor(i / bookTitles.length) + 1}` : ''),
            author: authors[i % authors.length],
            thumbnail_url: `https://picsum.photos/seed/prodthumb${i + 1}/270/400`,
            sale_price: sale_price,
            original_price: original_price,
            average_rating: parseFloat((Math.random() * 1.8 + 3.2).toFixed(1)), // Rating 3.2 - 5.0
            quantity_in_stock: Math.floor(Math.random() * 50) + 5,
            category: categories[i % categories.length],
            description: "Một cuốn sách tuyệt vời dành cho những ai đam mê khám phá và học hỏi. Với nội dung sâu sắc, trình bày rõ ràng và nhiều ví dụ minh họa thực tế, cuốn sách này sẽ là người bạn đồng hành không thể thiếu trên con đường chinh phục tri thức của bạn.",
            images: [
                `https://picsum.photos/seed/prodimg${i + 1}_1/600/800`,
                `https://picsum.photos/seed/prodimg${i + 1}_2/600/800`,
                `https://picsum.photos/seed/prodimg${i + 1}_3/600/800`,
            ],
            publisher: "NXB Tri Thức Việt",
            publication_year: 2023 + Math.floor(i / 5) % 3, // 2023, 2024, 2025
            page_count: Math.floor(Math.random() * 300) + 150, // 150-450 pages
            form_description: Math.random() > 0.5 ? "Bìa mềm" : "Bìa cứng",
        });
    }
    return products;
};

const ALL_PRODUCTS = generateFakeProducts(30);
// --- KẾT THÚC DỮ LIỆU GIẢ ---

const StarRating = ({ rating, size = 14, color = "#FFC107" }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.4; // Điều chỉnh ngưỡng cho nửa sao
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <View className="flex-row items-center">
            {[...Array(fullStars)].map((_, i) => <FontAwesome key={`full_${i}`} name="star" size={size} color={color} />)}
            {halfStar && <FontAwesome name="star-half-empty" size={size} color={color} />}
            {[...Array(emptyStars)].map((_, i) => <FontAwesome key={`empty_${i}`} name="star-o" size={size} color={color} />)}
            <Text className="text-xs text-gray-500 ml-1.5">{rating.toFixed(1)}</Text>
        </View>
    );
};

const ProductItem = ({ item, onPress }) => {
    const discountPercent = item.original_price > item.sale_price
        ? Math.round(((item.original_price - item.sale_price) / item.original_price) * 100)
        : 0;

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-lg shadow-md overflow-hidden m-2 flex-1 max-w-[48%]" // Sử dụng max-w để có 2 cột
        >
            <Image
                source={{ uri: item.thumbnail_url }}
                className="w-full h-48"
                resizeMode="cover"
            />
            {discountPercent > 0 && (
                <View className="absolute top-2 right-2 bg-red-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-semibold">-{discountPercent}%</Text>
                </View>
            )}
            <View className="p-3">
                <Text className="text-sm font-semibold text-gray-800 leading-tight" numberOfLines={2}>{item.title}</Text>
                <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>{item.author}</Text>
                <View className="mt-1.5">
                    <Text className="text-base font-bold text-sky-600">
                        {item.sale_price.toLocaleString('vi-VN')}₫
                    </Text>
                    {item.original_price > item.sale_price && (
                        <Text className="text-xs text-gray-400 line-through">
                            {item.original_price.toLocaleString('vi-VN')}₫
                        </Text>
                    )}
                </View>
                <View className="mt-1.5">
                    <StarRating rating={item.average_rating} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

function ProductScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Sẽ dùng khi có API

    const filteredProducts = useMemo(() => {
        if (!searchQuery) {
            return ALL_PRODUCTS;
        }
        return ALL_PRODUCTS.filter(product =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleProductPress = (product) => {
        router.push(`/product/${product.id}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            {/* Search Bar */}
            <View className="bg-white p-3 border-b border-gray-200 shadow-sm">
                <View className="flex-row items-center bg-slate-100 rounded-lg px-3 py-2.5">
                    <Ionicons name="search-outline" size={22} color="#6B7280" className="mr-2" />
                    <TextInput
                        className="flex-1 text-base text-gray-800"
                        placeholder="Tìm kiếm sách, tác giả..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                {/* TODO: Add filter buttons here if needed */}
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0EA5E9" />
                </View>
            ) : filteredProducts.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons name="sad-outline" size={70} color="#CBD5E1" />
                    <Text className="text-xl font-semibold text-gray-500 mt-4">Không tìm thấy sản phẩm</Text>
                    <Text className="text-gray-400 mt-1 text-center">
                        Vui lòng thử với từ khóa khác hoặc kiểm tra lại bộ lọc.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={({ item }) => <ProductItem item={item} onPress={() => handleProductPress(item)} />}
                    keyExtractor={item => item.id}
                    numColumns={2} // Hiển thị 2 cột
                    contentContainerStyle={{ paddingHorizontal: 6, paddingVertical: 8 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

export default ProductScreen;