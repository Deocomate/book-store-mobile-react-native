import { blogService, productService } from '@/services';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList, Image, ScrollView,
    StyleSheet,
    Text, TouchableOpacity, View
} from 'react-native';

const StarRating = ({ rating, size = 14, reviewCount = 0 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (<View className="flex-row items-center">
        {[...Array(fullStars)].map((_, i) => <FontAwesome key={`full_${i}`} name="star" size={size}
            color="#FFC107" />)}
        {halfStar && <FontAwesome name="star-half-empty" size={size} color="#FFC107" />}
        {[...Array(emptyStars)].map((_, i) => <FontAwesome key={`empty_${i}`} name="star-o" size={size}
            color="#FFC107" />)}
        <Text
            className="text-xs text-gray-600 ml-1">{rating ? rating.toFixed(1) : 'Mới'}{reviewCount > 0 ? ` (${reviewCount})` : ''}</Text>
    </View>);
};

let styles = StyleSheet.create({
    stretch: {
        resizeMode: 'stretch',
    },
});

const ProductCard = ({ product, onPress }) => {
    return (<TouchableOpacity onPress={onPress}
        className="bg-white rounded-lg shadow-md p-3 m-2 w-40 overflow-hidden active:opacity-80">
        <Image
            source={{ uri: product.thumbnail }}
            className="w-full h-48 rounded-md"
            contentFit="cover"
            placeholder={{ uri: 'https://via.placeholder.com/200x300/e0e0e0/999999?text=Book' }}
            transition={300}
        />
        <Text className="text-sm font-semibold mt-2 text-gray-800" numberOfLines={2}>{product.title}</Text>
        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>{product.author}</Text>
        <View className="mt-1">
            <Text className="text-sm font-bold text-sky-600">
                {product.discount?.toLocaleString('vi-VN')}₫
            </Text>
            {product.price > product.discount && (<Text className="text-xs text-gray-400 line-through">
                {product.price?.toLocaleString('vi-VN')}₫
            </Text>)}
        </View>
        {product.discountPercent > 0 && (<View className="absolute top-1 right-1 bg-red-500 px-1.5 py-0.5 rounded-full">
            <Text
                className="text-white text-[10px] font-semibold">-{Math.round(product.discountPercent)}%</Text>
        </View>)}
        <View className="mt-1">
            <StarRating rating={product.averageRate} reviewCount={product.rates?.length || 0} />
        </View>
    </TouchableOpacity>);
};

const categoryIcons = {
    "Văn Học": "book-open-page-variant-outline",
    "Kinh Tế": "finance",
    "Kỹ Năng Sống": "account-heart-outline",
    "Thiếu Nhi": "human-child",
    "Sách Nước Ngoài": "translate",
    "Lịch Sử": "bank",
    "Công nghệ": "laptop-chromebook",
    "Lập trình": "code-tags",
    "Phát triển Web": "web",
    "Mobile App": "cellphone",
    "Dữ liệu": "database-search-outline",
    "Default": "tag-outline"
};

const CategoryChip = ({ category, onPress }) => {
    const iconName = categoryIcons[category.name] || categoryIcons["Default"];
    return (<TouchableOpacity
        onPress={onPress}
        className="bg-sky-100 rounded-lg p-3 m-1.5 items-center w-24 h-24 justify-center shadow active:bg-sky-200"
    >
        <MaterialCommunityIcons name={iconName} size={28} color="#0369A1" />
        <Text className="text-xs text-sky-700 font-medium mt-1.5 text-center" numberOfLines={2}>
            {category.name}
        </Text>
    </TouchableOpacity>);
};

const createExcerpt = (content, maxLength = 100) => {
    if (!content) return "";
    const plainText = content.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + "...";
};

const BlogPostItem = ({ post, onPress }) => {
    return (<TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-lg shadow p-3 mx-4 mb-3 flex-row items-start active:bg-gray-50"
    >
        <Image
            source={{ uri: post.thumbnail }}
            className="w-24 h-24 rounded-md mr-3"
            contentFit="cover"
            placeholder={{ uri: 'https://via.placeholder.com/200x200/e0e0e0/999999?text=Blog' }}
            transition={300}
        />
        <View className="flex-1">
            <Text className="text-md font-semibold text-gray-800" numberOfLines={2}>{post.title}</Text>
            <Text className="text-xs text-gray-600 mt-1" numberOfLines={3}>{createExcerpt(post.content)}</Text>
            <Text className="text-xs text-sky-600 mt-1.5 font-medium">Đọc thêm</Text>
        </View>
    </TouchableOpacity>);
};

const PromotionalBanner = ({ title, subtitle, imageUrl, ctaText, onPress }) => {
    return (<TouchableOpacity onPress={onPress}
        // Đã xóa mx-4 và rounded-xl để banner full-width
        className="mb-4 w-full overflow-hidden shadow-lg aspect-[16/7] active:opacity-90">
        <Image source={{ uri: imageUrl }} className="absolute inset-0 w-full h-full" contentFit="cover" />
        <View className="absolute inset-0 bg-black/40 p-4 flex justify-end">
            <Text className="text-white text-2xl font-bold" style={{
                textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2
            }}>
                {title}
            </Text>
            <Text className="text-gray-200 text-sm mt-0.5" style={{
                textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2
            }}>
                {subtitle}
            </Text>
            {ctaText && (<View className="mt-3 self-start bg-white/95 px-4 py-2 rounded-lg shadow">
                <Text className="text-sky-700 font-semibold text-sm">{ctaText}</Text>
            </View>)}
        </View>
    </TouchableOpacity>);
};

const SectionHeader = ({ title, onSeeAll }) => (<View className="flex-row justify-between items-center px-4 mb-2 mt-4">
    <Text className="text-xl font-bold text-gray-800">{title}</Text>
    <TouchableOpacity onPress={onSeeAll} className="flex-row items-center p-2 -mr-2">
        <Text className="text-sm text-sky-600 font-semibold">Xem tất cả</Text>
        <Ionicons name="chevron-forward" size={16} color="#0284c7" />
    </TouchableOpacity>
</View>);

const SectionLoading = () => (<View className="h-48 justify-center items-center">
    <ActivityIndicator size="large" color="#0EA5E9" />
</View>);

const SectionError = ({ message, onRetry }) => (
    <View className="h-48 justify-center items-center p-4 bg-red-50 rounded-md mx-4 my-2 border border-red-200">
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        <Text className="text-red-600 text-center mt-2 mb-3">{message || "Không thể tải dữ liệu."}</Text>
        {onRetry && (<TouchableOpacity onPress={onRetry} className="bg-red-500 px-4 py-2 rounded-md">
            <Text className="text-white font-semibold text-sm">Thử lại</Text>
        </TouchableOpacity>)}
    </View>);

function HomeScreen() {
    const router = useRouter();

    const [newestProducts, setNewestProducts] = useState([]);
    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [bestSellerProducts, setBestSellerProducts] = useState([]);
    const [discountedProducts, setDiscountedProducts] = useState([]);
    const [latestBlogs, setLatestBlogs] = useState([]);

    const [loading, setLoading] = useState({
        newest: true, categories: true, bestSellers: true, blogs: true, discounted: true,
    });
    const [error, setError] = useState({
        newest: null, categories: null, bestSellers: null, blogs: null, discounted: null,
    });

    const fetchNewestProducts = async () => {
        setLoading(prev => ({ ...prev, newest: true }));
        setError(prev => ({ ...prev, newest: null }));
        try {
            const response = await productService.getActiveProducts({ sortBy: 'createdAt', sortDir: 'DESC' }, 1, 6);
            if (response && response.status === 200 && response.result && response.result.data) {
                setNewestProducts(response.result.data);
            } else {
                throw new Error(response?.message || "Không thể tải sách mới nhất");
            }
        } catch (err) {
            setError(prev => ({ ...prev, newest: err.message || "Lỗi tải sách mới" }));
        } finally {
            setLoading(prev => ({ ...prev, newest: false }));
        }
    };

    const fetchFeaturedCategories = async () => {
        setLoading(prev => ({ ...prev, categories: true }));
        setError(prev => ({ ...prev, categories: null }));
        try {
            const response = await productService.getProductCategories();
            if (response && response.status === 200 && response.result) {
                const sortedCategories = response.result
                    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                    .slice(0, 6);
                setFeaturedCategories(sortedCategories);
            } else {
                throw new Error(response?.message || "Không thể tải danh mục");
            }
        } catch (err) {
            setError(prev => ({ ...prev, categories: err.message || "Lỗi tải danh mục" }));
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    const fetchBestSellerProducts = async () => {
        setLoading(prev => ({ ...prev, bestSellers: true }));
        setError(prev => ({ ...prev, bestSellers: null }));
        try {
            const response = await productService.getTopRatingProducts();
            if (response && response.status === 200 && response.result) {
                setBestSellerProducts(response.result.slice(0, 6));
            } else {
                throw new Error(response?.message || "Không thể tải sách bán chạy");
            }
        } catch (err) {
            setError(prev => ({ ...prev, bestSellers: err.message || "Lỗi tải sách bán chạy" }));
        } finally {
            setLoading(prev => ({ ...prev, bestSellers: false }));
        }
    };

    const fetchDiscountedProducts = async () => {
        setLoading(prev => ({ ...prev, discounted: true }));
        setError(prev => ({ ...prev, discounted: null }));
        try {
            const response = await productService.getTopDiscountProducts();
            if (response && response.status === 200 && response.result) {
                setDiscountedProducts(response.result.slice(0, 6));
            } else {
                throw new Error(response?.message || "Không thể tải sản phẩm khuyến mãi");
            }
        } catch (err) {
            setError(prev => ({ ...prev, discounted: err.message || "Lỗi tải sản phẩm khuyến mãi" }));
        } finally {
            setLoading(prev => ({ ...prev, discounted: false }));
        }
    };

    const fetchLatestBlogs = async () => {
        setLoading(prev => ({ ...prev, blogs: true }));
        setError(prev => ({ ...prev, blogs: null }));
        try {
            const response = await blogService.getAllBlogs({ sortDirection: 'DESC' }, 1, 3);
            if (response && response.status === 200 && response.result && response.result.data) {
                setLatestBlogs(response.result.data);
            } else {
                throw new Error(response?.message || "Không thể tải bài viết mới");
            }
        } catch (err) {
            setError(prev => ({ ...prev, blogs: err.message || "Lỗi tải bài viết" }));
        } finally {
            setLoading(prev => ({ ...prev, blogs: false }));
        }
    };

    useEffect(() => {
        fetchNewestProducts();
        fetchFeaturedCategories();
        fetchBestSellerProducts();
        fetchDiscountedProducts();
        fetchLatestBlogs();
    }, []);

    const handleProductPress = (product) => router.push(`/(app)/product/${product.id}`);
    const handleCategoryPress = (category) => router.push(`/(app)/product?category_id=${category.id}&category_name=${encodeURIComponent(category.name)}`);
    const handleBlogPostPress = (post) => router.push(`/(app)/blog/${post.id || post.id}`);

    return (<ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
        {/* Search Header */}
        <View className="p-4 bg-sky-600">
            <TouchableOpacity
                onPress={() => router.push('/(app)/product/')}
                className="bg-white rounded-full flex-row items-center px-4 py-3 shadow-md"
            >
                <Ionicons name="search" size={20} color="#64748b" />
                <Text className="text-gray-500 ml-3 text-base">Tìm kiếm sách, tác giả...</Text>
            </TouchableOpacity>
        </View>

        {/* Promotional Banner */}
        <PromotionalBanner
            title="Ưu Đãi Giữa Năm!"
            subtitle="Giảm giá đến 50% cho hàng ngàn đầu sách."
            imageUrl="https://picsum.photos/seed/midyearbooks/800/350"
            ctaText="Khám phá ngay"
            onPress={() => router.push('/(app)/product/')}
        />

        {/* Newest Products Section */}
        <View className="my-3">
            <SectionHeader title="Sách Mới Nhất"
                onSeeAll={() => router.push('/(app)/product?sort_by=createdAt&sort_dir=DESC')} />
            {loading.newest ? <SectionLoading /> : error.newest ?
                <SectionError message={error.newest} onRetry={fetchNewestProducts} /> : (<FlatList
                    data={newestProducts}
                    renderItem={({ item }) => <ProductCard product={item}
                        onPress={() => handleProductPress(item)} />}
                    keyExtractor={item => `newest_${item.id.toString()}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}
                />)}
        </View>

        {/* Featured Categories Section */}
        <View className="my-3">
            <SectionHeader title="Danh Mục Nổi Bật" onSeeAll={() => router.push('/(app)/product/')} />
            {loading.categories ? <SectionLoading /> : error.categories ?
                <SectionError message={error.categories} onRetry={fetchFeaturedCategories} /> : (<FlatList
                    data={featuredCategories}
                    renderItem={({ item }) => <CategoryChip category={item}
                        onPress={() => handleCategoryPress(item)} />}
                    keyExtractor={item => `cat_${item.id.toString()}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}
                />)}
        </View>

        {/* Best Sellers Section */}
        <View className="my-3">
            <SectionHeader title="Sách Bán Chạy"
                onSeeAll={() => router.push('/(app)/product?sort_by=averageRate&sort_dir=DESC')} />
            {loading.bestSellers ? <SectionLoading /> : error.bestSellers ?
                <SectionError message={error.bestSellers} onRetry={fetchBestSellerProducts} /> : (<FlatList
                    data={bestSellerProducts}
                    renderItem={({ item }) => <ProductCard product={item}
                        onPress={() => handleProductPress(item)} />}
                    keyExtractor={item => `bestseller_${item.id.toString()}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}
                />)}
        </View>

        {/* Discounted Products Section */}
        <View className="my-3">
            <SectionHeader title="Sản Phẩm Khuyến Mãi"
                onSeeAll={() => router.push('/(app)/product?sort_by=discountPercent&sort_dir=DESC')} />
            {loading.discounted ? <SectionLoading /> : error.discounted ?
                <SectionError message={error.discounted} onRetry={fetchDiscountedProducts} /> : (<FlatList
                    data={discountedProducts}
                    renderItem={({ item }) => <ProductCard product={item}
                        onPress={() => handleProductPress(item)} />}
                    keyExtractor={item => `discounted_${item.id.toString()}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}
                />)}
        </View>

        {/* Latest Blogs Section */}
        <View className="my-3 pb-4">
            <SectionHeader title="Tin Tức & Bài Viết" onSeeAll={() => router.push('/(app)/blog/')} />
            {loading.blogs ? <SectionLoading /> : error.blogs ?
                <SectionError message={error.blogs} onRetry={fetchLatestBlogs} /> : (latestBlogs.map(post => (
                    <BlogPostItem key={post.id.toString()} post={post}
                        onPress={() => handleBlogPostPress(post)} />)))}
        </View>
    </ScrollView>);
}


export default HomeScreen;