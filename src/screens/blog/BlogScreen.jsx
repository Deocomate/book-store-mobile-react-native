// src/screens/blog/BlogScreen.jsx
import { blogService } from '@/services'; // Chỉ cần blogService
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const createExcerpt = (content, maxLength = 100) => {
    if (!content) return "";
    // Remove HTML tags for excerpt
    const plainText = content.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + "...";
};

const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
        return 'N/A';
    }
};

const BlogListItem = ({ blog, onPress, categoryName }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-xl shadow-lg overflow-hidden mx-4 my-3 active:opacity-80"
        >
            <Image
                source={{ uri: blog.thumbnail }} // API đã trả về URL đầy đủ
                className="w-full h-52"
                contentFit="cover"
                placeholder={{ uri: 'https://via.placeholder.com/400x250/e0e0e0/999999?text=Blog' }}
                transition={300}
            />
            <View className="p-4">
                {categoryName && (
                    <Text className="text-xs text-sky-600 font-semibold uppercase tracking-wide mb-1">
                        {categoryName}
                    </Text>
                )}
                <Text className="text-xl font-bold text-gray-800 mt-1 leading-tight" numberOfLines={2}>
                    {blog.title}
                </Text>
                <Text className="text-sm text-gray-600 mt-2" numberOfLines={3}>
                    {createExcerpt(blog.content)}
                </Text>
                <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-200">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="calendar-clock-outline" size={16} color="#4B5563" />
                        <Text className="text-xs text-gray-700 ml-1.5">{formatDate(blog.createdAt)}</Text>
                    </View>
                    {/* Author and View Count can be added if API provides them */}
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


function BlogScreen() {
    const router = useRouter();
    const [blogs, setBlogs] = useState([]);
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
    const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null means all categories


    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const fetchCategories = useCallback(async () => {
        // No separate loading state for categories, assumed to be quick
        try {
            const response = await blogService.getAllBlogCategories();
            if (response && response.status === 200 && response.result) {
                setCategories([{ id: null, name: 'Tất cả' }, ...response.result]); // Add "All" option
            } else {
                console.warn("Could not fetch blog categories:", response?.message);
            }
        } catch (err) {
            console.error("Error fetching blog categories:", err);
        }
    }, []);

    const fetchBlogs = useCallback(async (page = 1, isRefreshing = false, newSearch = false, newCategory = false) => {
        if (loadingMore && !isRefreshing) return;
        if (page === 1) setLoading(true);
        else if (!isRefreshing) setLoadingMore(true);

        setError(null);

        const filter = {};
        if (debouncedSearchQuery.trim()) {
            filter.title = debouncedSearchQuery.trim();
        }
        if (selectedCategoryId) {
            filter.categoryId = selectedCategoryId;
        }

        try {
            const response = await blogService.getAllBlogs(filter, page, pageSize);
            if (response && response.status === 200 && response.result) {
                const newBlogs = response.result.data || [];
                if (isRefreshing || page === 1 || newSearch || newCategory) {
                    setBlogs(newBlogs);
                } else {
                    setBlogs(prevBlogs => [...prevBlogs, ...newBlogs]);
                }
                setTotalPages(response.result.totalPages || 1);
                setPageIndex(page);
            } else {
                throw new Error(response?.message || "Không thể tải danh sách bài viết.");
            }
        } catch (err) {
            console.error("Error fetching blogs:", err);
            setError(err.message);
            if (page === 1) setBlogs([]); // Clear blogs on initial load error
        } finally {
            setLoading(false);
            setLoadingMore(false);
            if (isRefreshing) setRefreshing(false);
        }
    }, [debouncedSearchQuery, selectedCategoryId, pageSize, loadingMore]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        // Fetch blogs when debounced search query or category changes
        fetchBlogs(1, false, true, true); // isNewSearch = true, isNewCategory = true to reset list
    }, [debouncedSearchQuery, selectedCategoryId, fetchBlogs]);


    const handleRefresh = () => {
        setRefreshing(true);
        fetchBlogs(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && pageIndex < totalPages) {
            fetchBlogs(pageIndex + 1);
        }
    };

    const handleBlogPostPress = (blog) => {
        router.push(`/blog/${blog.id}`); // API get by ID
    };

    const getCategoryNameById = useCallback((categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Chưa phân loại';
    }, [categories]);

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
                        placeholder="Tìm kiếm bài viết..."
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
            {categories.length > 1 && ( // Show if more than "All" category exists
                <View className="py-2 bg-white border-b border-gray-200">
                    <FlatList
                        data={categories}
                        renderItem={({ item }) => (
                            <CategoryFilterChip
                                category={item}
                                onPress={() => {
                                    setSelectedCategoryId(item.id);
                                    setPageIndex(1); // Reset page index on category change
                                }}
                                isSelected={selectedCategoryId === item.id}
                            />
                        )}
                        keyExtractor={item => item.id ? item.id.toString() : 'all_categories'}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 10 }}
                    />
                </View>
            )}


            {loading && pageIndex === 1 && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0EA5E9" />
                </View>
            ) : error && blogs.length === 0 ? ( // Show error only if no blogs are displayed
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons name="cloud-offline-outline" size={70} color="#CBD5E1" />
                    <Text className="text-lg font-semibold text-gray-500 mt-4">Lỗi tải dữ liệu</Text>
                    <Text className="text-gray-400 mt-1 text-center mb-3">{error}</Text>
                    <TouchableOpacity
                        onPress={() => fetchBlogs(1, true)}
                        className="bg-sky-500 px-5 py-2.5 rounded-lg shadow active:bg-sky-600"
                    >
                        <Text className="text-white font-medium">Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : blogs.length === 0 && !loading ? (
                <View className="flex-1 justify-center items-center p-5">
                    <MaterialCommunityIcons name="text-box-search-outline" size={70} color="#CBD5E1" />
                    <Text className="text-xl font-semibold text-gray-500 mt-4">Không tìm thấy bài viết</Text>
                    <Text className="text-gray-400 mt-1 text-center">
                        Vui lòng thử với từ khóa hoặc bộ lọc khác.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={blogs}
                    renderItem={({ item }) => (
                        <BlogListItem
                            blog={item}
                            onPress={() => handleBlogPostPress(item)}
                            categoryName={getCategoryNameById(item.categoryId)}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingVertical: 12 }}
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

export default BlogScreen;