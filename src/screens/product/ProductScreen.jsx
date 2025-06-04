// src/screens/product/ProductScreen.jsx
import { productService } from '@/services'; // Sử dụng productService
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const StarRating = ({ rating, size = 14, color = "#FFC107", reviewCount = 0 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.4;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <View className="flex-row items-center">
            {[...Array(fullStars)].map((_, i) => <FontAwesome key={`full_${i}`} name="star" size={size} color={color} />)}
            {halfStar && <FontAwesome name="star-half-empty" size={size} color={color} />}
            {[...Array(emptyStars)].map((_, i) => <FontAwesome key={`empty_${i}`} name="star-o" size={size} color={color} />)}
            {reviewCount > 0 && <Text className="text-xs text-gray-500 ml-1.5">({reviewCount})</Text>}
        </View>
    );
};

const ProductItem = ({ item, onPress }) => {
    // item.discount là giá bán (sale_price từ DB)
    // item.price là giá gốc (original_price từ DB)
    // item.discountPercent được tính sẵn từ backend
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-lg shadow-md overflow-hidden m-2 flex-1 max-w-[48%] active:opacity-80"
        >
            <Image
                source={{ uri: item.thumbnail }} // API đã trả về URL đầy đủ
                className="w-full h-48"
                resizeMode="cover"
                placeholder={{ uri: 'https://via.placeholder.com/270x400/e0e0e0/999999?text=Book' }}
                transition={300}
            />
            {item.discountPercent > 0 && (
                <View className="absolute top-2 right-2 bg-red-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-semibold">-{Math.round(item.discountPercent)}%</Text>
                </View>
            )}
            <View className="p-3">
                <Text className="text-sm font-semibold text-gray-800 leading-tight" numberOfLines={2}>{item.title}</Text>
                <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>{item.author}</Text>
                <View className="mt-1.5">
                    <Text className="text-base font-bold text-sky-600">
                        {item.discount?.toLocaleString('vi-VN')}₫
                    </Text>
                    {item.price > item.discount && (
                        <Text className="text-xs text-gray-400 line-through">
                            {item.price?.toLocaleString('vi-VN')}₫
                        </Text>
                    )}
                </View>
                <View className="mt-1.5">
                    <StarRating rating={item.averageRate} reviewCount={item.rates?.length || 0} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const CategoryFilterChip = ({ category, onPress, isSelected }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`px-4 py-2 rounded-full m-1.5 border ${isSelected ? 'bg-sky-500 border-sky-500' : 'bg-white border-sky-300 active:bg-sky-100'}`}
    >
        <Text className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-sky-700'}`}>{category.name}</Text>
    </TouchableOpacity>
);

function ProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams(); // Để nhận category_id và sort_by từ HomeScreen

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(params.category_id ? parseInt(params.category_id) : null);
    const [sortBy, setSortBy] = useState(params.sort_by || 'createdAt'); // 'createdAt', 'price', 'top_rating'
    const [sortDir, setSortDir] = useState('DESC'); // 'ASC', 'DESC'


    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await productService.getProductCategories();
            if (response && response.status === 200 && response.result) {
                setCategories([{ id: null, name: 'Tất cả' }, ...response.result]);
            } else {
                console.warn("Could not fetch product categories:", response?.message);
            }
        } catch (err) {
            console.error("Error fetching product categories:", err);
        }
    }, []);

    const fetchProducts = useCallback(async (page = 1, isRefreshing = false, newSearchOrFilter = false) => {
        if (loadingMore && !isRefreshing) return;
        if (page === 1) setLoading(true);
        else if (!isRefreshing) setLoadingMore(true);
        setError(null);

        const filterParams = {};
        if (debouncedSearchQuery.trim()) filterParams.title = debouncedSearchQuery.trim(); // API hỗ trợ tìm theo title
        if (selectedCategoryId) filterParams.categoryId = selectedCategoryId;

        // Sắp xếp
        if (sortBy) filterParams.sortBy = sortBy; // ví dụ: 'price', 'createdAt'
        if (sortDir) filterParams.sortDir = sortDir; // 'ASC', 'DESC'

        try {
            // Dùng getActiveProducts để chỉ lấy sản phẩm đang active
            const response = await productService.getActiveProducts(filterParams, page, pageSize);
            if (response && response.status === 200 && response.result) {
                const newProducts = response.result.data || [];
                if (isRefreshing || page === 1 || newSearchOrFilter) {
                    setProducts(newProducts);
                } else {
                    setProducts(prevProducts => [...prevProducts, ...newProducts]);
                }
                setTotalPages(response.result.totalPages || 1);
                setPageIndex(page);
            } else {
                throw new Error(response?.message || "Không thể tải danh sách sản phẩm.");
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message);
            if (page === 1) setProducts([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            if (isRefreshing) setRefreshing(false);
        }
    }, [debouncedSearchQuery, selectedCategoryId, sortBy, sortDir, pageSize, loadingMore]);


    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        // Nếu có params từ route, set state tương ứng
        if (params.category_id && parseInt(params.category_id) !== selectedCategoryId) {
            setSelectedCategoryId(parseInt(params.category_id));
        }
        if (params.sort_by && params.sort_by !== sortBy) {
            setSortBy(params.sort_by);
        }
        // Fetch products khi có sự thay đổi từ search, category, sort
        fetchProducts(1, false, true);
    }, [debouncedSearchQuery, selectedCategoryId, sortBy, sortDir, fetchProducts, params.category_id, params.sort_by]);


    const handleRefresh = () => {
        setRefreshing(true);
        fetchProducts(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && pageIndex < totalPages) {
            fetchProducts(pageIndex + 1);
        }
    };

    const handleProductPress = (product) => {
        router.push(`/(app)/product/${product.id}`);
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#0EA5E9" />;
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
            </View>

            {/* Category Filters */}
            {categories.length > 1 && (
                <View className="py-2 bg-white border-b border-gray-200">
                    <FlatList
                        data={categories}
                        renderItem={({ item }) => (
                            <CategoryFilterChip
                                category={item}
                                onPress={() => {
                                    setSelectedCategoryId(item.id);
                                    setPageIndex(1); // Reset page
                                }}
                                isSelected={selectedCategoryId === item.id}
                            />
                        )}
                        keyExtractor={item => item.id ? item.id.toString() : 'all_categories_product'}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 10 }}
                    />
                </View>
            )}

            {/* TODO: Add Sort Options Picker here if needed (e.g., Giá tăng dần, Giá giảm dần, Mới nhất, Đánh giá cao) */}


            {loading && pageIndex === 1 && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0EA5E9" />
                </View>
            ) : error && products.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons name="cloud-offline-outline" size={70} color="#CBD5E1" />
                    <Text className="text-lg font-semibold text-gray-500 mt-4">Lỗi tải dữ liệu</Text>
                    <Text className="text-gray-400 mt-1 text-center mb-3">{error}</Text>
                    <TouchableOpacity
                        onPress={() => fetchProducts(1, true)}
                        className="bg-sky-500 px-5 py-2.5 rounded-lg shadow active:bg-sky-600"
                    >
                        <Text className="text-white font-medium">Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : products.length === 0 && !loading ? (
                <View className="flex-1 justify-center items-center p-5">
                    <MaterialCommunityIcons name="book-search-outline" size={70} color="#CBD5E1" />
                    <Text className="text-xl font-semibold text-gray-500 mt-4">Không tìm thấy sản phẩm</Text>
                    <Text className="text-gray-400 mt-1 text-center">
                        Vui lòng thử với từ khóa hoặc bộ lọc khác.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={({ item }) => <ProductItem item={item} onPress={() => handleProductPress(item)} />}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 6, paddingVertical: 8 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#0EA5E9"]} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

export default ProductScreen;