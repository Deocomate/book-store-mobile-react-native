// src/screens/blog/BlogDetailScreen.jsx
import { blogService } from '@/services'; // Import blogService
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';

const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day} tháng ${month}, ${year}`;
    } catch (e) {
        return 'N/A';
    }
};

function BlogDetailScreen({ id: blogId }) { // id từ route params được truyền vào là blogId
    const [blog, setBlog] = useState(null);
    const [categoryName, setCategoryName] = useState('Chưa phân loại');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const fetchBlogDetails = useCallback(async () => {
        if (!blogId) {
            setError("Không có ID bài viết.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await blogService.getBlogById(blogId);
            if (response && response.status === 200 && response.result) {
                setBlog(response.result);
                // Fetch category name if categoryId exists
                if (response.result.categoryId) {
                    const catResponse = await blogService.getAllBlogCategories(); // This fetches all, not ideal but works for now
                    if (catResponse && catResponse.status === 200 && catResponse.result) {
                        const foundCategory = catResponse.result.find(c => c.id === response.result.categoryId);
                        if (foundCategory) {
                            setCategoryName(foundCategory.name);
                        }
                    }
                }
            } else {
                throw new Error(response?.message || "Không tìm thấy bài viết.");
            }
        } catch (err) {
            console.error("Error fetching blog details:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [blogId]);

    useEffect(() => {
        fetchBlogDetails();
    }, [fetchBlogDetails]);

    const handleShare = async () => {
        if (!blog) return;
        try {
            await Share.share({
                message: `Đọc bài viết thú vị này: ${blog.title} | BookStore App`,
                // Nên có một domain thực tế hoặc sử dụng deeplink
                url: `https://mybookstore.app/blog/${blog.slug || blog.id}`,
                title: blog.title,
            });
        } catch (error) {
            Alert.alert("Lỗi", "Không thể chia sẻ bài viết.");
            console.error('Error sharing:', error.message);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
        );
    }

    if (error || !blog) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50 p-6">
                <Stack.Screen options={{ title: 'Lỗi' }} />
                <MaterialCommunityIcons name="alert-circle-outline" size={72} color="#EF4444" />
                <Text className="text-2xl font-semibold text-gray-700 mt-5">
                    {error ? "Lỗi tải bài viết" : "Không tìm thấy bài viết"}
                </Text>
                <Text className="text-gray-500 mt-2.5 text-center">
                    {error || "Bài viết bạn đang tìm không còn tồn tại hoặc đường dẫn đã bị thay đổi."}
                </Text>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/blog/')}
                    className="mt-6 bg-sky-500 px-6 py-3 rounded-lg shadow active:bg-sky-600"
                >
                    <Text className="text-white font-semibold">Quay lại Blog</Text>
                </TouchableOpacity>
            </View>
        );
    }
    // Author and View Count: Not available in current BlogResponse from blog-service
    // const authorName = blog.author_name || "Người viết ẩn danh";
    // const viewCount = blog.view_count || 0;

    return (
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
            {/* Sử dụng thumbnail vì API hiện tại chỉ có trường này */}
            <Image
                source={{ uri: blog.thumbnail }}
                className="w-full h-72"
                contentFit="cover"
                placeholder={{ uri: 'https://via.placeholder.com/800x400/e0e0e0/999999?text=Blog+Image' }}
                transition={300}
            />

            <View className="p-5 lg:p-8">
                {/* Category Badge */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text
                        className="text-sm text-sky-600 font-semibold bg-sky-100 px-3.5 py-1.5 rounded-full self-start uppercase tracking-wider">
                        {categoryName}
                    </Text>
                    <TouchableOpacity onPress={handleShare} className="p-2">
                        <Ionicons name="share-social-outline" size={24} color="#4B5563" />
                    </TouchableOpacity>
                </View>


                {/* Title */}
                <Text className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                    {blog.title}
                </Text>

                {/* Date Info - Author and View Count removed as not in API response */}
                <View className="flex-row flex-wrap items-center my-4 text-gray-600 space-x-2 sm:space-x-5">
                    <View className="flex-row items-center mb-2 sm:mb-0">
                        <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#4B5563" />
                        <Text className="text-sm text-gray-700 ml-1.5">{formatDate(blog.createdAt)}</Text>
                    </View>
                    {/* <View className="flex-row items-center mb-2 sm:mb-0">
                        <MaterialCommunityIcons name="account-circle-outline" size={18} color="#4B5563" />
                        <Text className="text-sm text-gray-700 ml-1.5">{authorName}</Text>
                    </View>
                    <View className="flex-row items-center mb-2 sm:mb-0">
                        <Ionicons name="eye-outline" size={18} color="#4B5563" />
                        <Text className="text-sm text-gray-700 ml-1.5">{viewCount.toLocaleString()} lượt xem</Text>
                    </View> */}
                </View>

                {/* Content Separator */}
                <View className="border-b border-gray-200 my-6" />

                {/* Content - Render HTML if content is HTML, otherwise render as plain text */}
                {/* For now, assuming plain text or simple HTML that React Native Text can handle.
                    If complex HTML, a WebView or html-renderer library would be needed.
                */}
                <Text className="text-lg text-justify text-gray-800 leading-relaxed whitespace-pre-line">
                    {blog.content.replace(/<[^>]+>/g, '')} {/* Basic HTML tag removal */}
                </Text>


                {/* Tags Example (nếu có) - Placeholder for now */}
                <View className="mt-8 pt-6 border-t border-gray-200">
                    <Text className="text-base font-semibold text-gray-500 mb-3">CHỦ ĐỀ LIÊN QUAN:</Text>
                    <View className="flex-row flex-wrap">
                        {[categoryName, "Bài Viết Hay", "Chia Sẻ"].map(tag => (
                            <View key={tag} className="bg-gray-100 rounded-full px-4 py-1.5 mr-2 mb-2 shadow-sm">
                                <Text className="text-xs text-gray-700 font-medium">{tag.toUpperCase()}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Comments Section Placeholder */}
                <View className="mt-10 pt-8 border-t border-gray-200">
                    <Text className="text-2xl font-bold text-gray-800 mb-5">Bình luận (0)</Text>
                    <View className="bg-slate-100 p-6 rounded-lg shadow">
                        <Text className="text-gray-500 text-center">
                            Tính năng bình luận hiện đang được phát triển.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

export default BlogDetailScreen;