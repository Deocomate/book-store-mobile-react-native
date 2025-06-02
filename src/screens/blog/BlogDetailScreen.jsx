import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Share, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler'; // For share button

// --- DỮ LIỆU GIẢ --- (Copy hàm generateDetailedFakeBlogs, allFakeBlogs và getBlogBySlugOrId vào đây hoặc import)
const generateDetailedFakeBlogs = (count = 15) => {
    const blogs = [];
    const titles = ["10 Cuốn Sách Nên Đọc Trong Hè Này", "Tìm Hiểu Về Tiểu Thuyết Hiện Đại", "Cách Rèn Luyện Thói Quen Đọc Sách Mỗi Ngày", "Những Tác Giả Trẻ Triển Vọng Của Năm", "Phân Tích Sâu Về Tác Phẩm 'Số Đỏ'", "Lịch Sử Phát Triển Của Thơ Ca Việt Nam", "Review Sách: Nhà Giả Kim - Hành Trình Tâm Linh", "Xu Hướng Đọc Sách Của Giới Trẻ Hiện Nay"];
    const authors = ["Nguyễn Văn An", "Trần Thị Mai", "Lê Minh Trí", "Phạm Thuỳ Dương", "Bookworm Admin"];
    const categories = [{ id: "cat_vanhoc", name: "Văn Học" }, {
        id: "cat_kynang", name: "Kỹ Năng Sống"
    }, { id: "cat_doisong", name: "Đời Sống" }, { id: "cat_kinhte", name: "Kinh Tế" }, {
        id: "cat_thieunhi", name: "Thiếu Nhi"
    },];
    const baseContentParagraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n";

    for (let i = 0; i < count; i++) {
        const publishedDate = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)); // Random date in last 90 days
        const numParagraphs = Math.floor(Math.random() * 5) + 3; // 3 to 7 paragraphs
        let fullContent = `Mở đầu cho bài viết "${titles[i % titles.length]}".\n\n`;
        for (let j = 0; j < numParagraphs; j++) {
            fullContent += `Đây là đoạn văn thứ ${j + 1} của bài viết. ` + baseContentParagraph;
        }
        fullContent += "Kết thúc bài viết. Cảm ơn bạn đã đọc!";

        blogs.push({
            blog_id: `blog_post_${i + 1}`,
            slug: `${titles[i % titles.length].toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}-${i + 1}`,
            title: titles[i % titles.length] + (count > titles.length ? ` (Phần ${Math.floor(i / titles.length) + 1})` : ''),
            content: fullContent,
            thumbnail_url: `https://picsum.photos/seed/blogthumb${i + Math.floor(Math.random() * 1000)}/400/250`,
            large_image_url: `https://picsum.photos/seed/bloglarge${i + Math.floor(Math.random() * 1000)}/800/400`,
            category: categories[i % categories.length],
            author_name: authors[i % authors.length],
            published_at: publishedDate.toISOString(),
            view_count: Math.floor(Math.random() * 10000) + 200,
            excerpt: "Khám phá những phân tích sâu sắc và các mẹo hữu ích trong bài viết này. " + baseContentParagraph.substring(0, 120) + "...",
        });
    }
    return blogs;
};
const allFakeBlogs = generateDetailedFakeBlogs(15);
const getBlogBySlugOrId = (identifier) => {
    return allFakeBlogs.find(blog => blog.slug === identifier || blog.blog_id === identifier);
};

// --- KẾT THÚC DỮ LIỆU GIẢ ---

function BlogDetailScreen({ id }) {
    let blogIdentifier = id
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (blogIdentifier) {
            const foundBlog = getBlogBySlugOrId(blogIdentifier);
            setBlog(foundBlog);
        }
        setLoading(false);
    }, [blogIdentifier]);

    const handleShare = async () => {
        if (!blog) return;
        try {
            const result = await Share.share({
                message: `Đọc bài viết thú vị này: ${blog.title} | BookStore App`,
                url: `https://your-app-domain.com/blog/${blog.slug}`, // Thay bằng URL thực của bạn
                title: blog.title,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Shared');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing:', error.message);
        }
    };


    if (loading) {
        return (<View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#0EA5E9" />
        </View>);
    }

    if (!blog) {
        return (<View className="flex-1 justify-center items-center bg-slate-50 p-6">
            <Stack.Screen options={{ title: 'Không tìm thấy' }} />
            <MaterialCommunityIcons name="text-box-remove-outline" size={72} color="#94A3B8" />
            <Text className="text-2xl font-semibold text-gray-700 mt-5">Không tìm thấy bài viết</Text>
            <Text className="text-gray-500 mt-2.5 text-center">
                Bài viết bạn đang tìm không còn tồn tại hoặc đường dẫn đã bị thay đổi.
            </Text>
            <TouchableOpacity
                onPress={() => router.back()}
                className="mt-6 bg-sky-500 px-6 py-3 rounded-lg shadow active:bg-sky-600"
            >
                <Text className="text-white font-semibold">Quay lại</Text>
            </TouchableOpacity>
        </View>);
    }

    const publishedDate = new Date(blog.published_at);
    const formattedDate = `${publishedDate.getDate()} tháng ${publishedDate.getMonth() + 1}, ${publishedDate.getFullYear()}`;

    return (<ScrollView className="flex-1 bg-white">
        <Image
            source={{ uri: blog.large_image_url || blog.thumbnail_url }}
            className="w-full h-72"
            contentFit="cover"
            placeholder={{ uri: 'https://via.placeholder.com/800x400/e0e0e0/999999?text=Blog+Image' }}
            transition={300}
        />

        <View className="p-5 lg:p-8">
            {/* Category Badge */}
            <View className="mb-4">
                <Text
                    className="text-sm text-sky-600 font-semibold bg-sky-100 px-3.5 py-1.5 rounded-full self-start uppercase tracking-wider">
                    {blog.category.name}
                </Text>
            </View>

            {/* Title */}
            <Text
                className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">{blog.title}</Text>

            {/* Author and Date Info */}
            <View className="flex-row flex-wrap items-center my-4 text-gray-600 space-x-2 sm:space-x-5">
                <View className="flex-row items-center mb-2 sm:mb-0">
                    <MaterialCommunityIcons name="account-circle-outline" size={18} color="#4B5563" />
                    <Text className="text-sm text-gray-700 ml-1.5">{blog.author_name}</Text>
                </View>
                <View className="flex-row items-center mb-2 sm:mb-0">
                    <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#4B5563" />
                    <Text className="text-sm text-gray-700 ml-1.5">{formattedDate}</Text>
                </View>
                <View className="flex-row items-center mb-2 sm:mb-0">
                    <Ionicons name="eye-outline" size={18} color="#4B5563" />
                    <Text className="text-sm text-gray-700 ml-1.5">{blog.view_count.toLocaleString()} lượt
                        xem</Text>
                </View>
            </View>

            {/* Content Separator */}
            <View className="border-b border-gray-200 my-6" />

            {/* Content */}
            <Text className="text-lg text-justify text-gray-800 leading-relaxed whitespace-pre-line">
                {blog.content}
            </Text>

            {/* Tags Example (nếu có) */}
            <View className="mt-8 pt-6 border-t border-gray-200">
                <Text className="text-base font-semibold text-gray-500 mb-3">CHỦ ĐỀ LIÊN QUAN:</Text>
                <View className="flex-row flex-wrap">
                    {[blog.category.name, "Sách Hay", "Review"].map(tag => (
                        <View key={tag} className="bg-gray-100 rounded-full px-4 py-1.5 mr-2 mb-2 shadow-sm">
                            <Text className="text-xs text-gray-700 font-medium">{tag.toUpperCase()}</Text>
                        </View>))}
                </View>
            </View>

            {/* Comments Section Placeholder */}
            <View className="mt-10 pt-8 border-t border-gray-200">
                <Text className="text-2xl font-bold text-gray-800 mb-5">Bình luận
                    ({Math.floor(Math.random() * 20)})</Text>
                <View className="bg-slate-100 p-6 rounded-lg shadow">
                    <Text className="text-gray-500 text-center">
                        Tính năng bình luận hiện đang được phát triển. Vui lòng quay lại sau!
                    </Text>
                </View>
            </View>
        </View>
    </ScrollView>);
}

export default BlogDetailScreen;