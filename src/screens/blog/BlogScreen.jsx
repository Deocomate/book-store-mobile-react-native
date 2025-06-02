import React from 'react';
import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';

// --- DỮ LIỆU GIẢ --- (Copy hàm generateDetailedFakeBlogs và allFakeBlogs vào đây hoặc import từ file chung)
const generateDetailedFakeBlogs = (count = 15) => {
    const blogs = [];
    const titles = ["10 Cuốn Sách Nên Đọc Trong Hè Này", "Tìm Hiểu Về Tiểu Thuyết Hiện Đại", "Cách Rèn Luyện Thói Quen Đọc Sách Mỗi Ngày", "Những Tác Giả Trẻ Triển Vọng Của Năm", "Phân Tích Sâu Về Tác Phẩm 'Số Đỏ'", "Lịch Sử Phát Triển Của Thơ Ca Việt Nam", "Review Sách: Nhà Giả Kim - Hành Trình Tâm Linh", "Xu Hướng Đọc Sách Của Giới Trẻ Hiện Nay"];
    const authors = ["Nguyễn Văn An", "Trần Thị Mai", "Lê Minh Trí", "Phạm Thuỳ Dương", "Bookworm Admin"];
    const categories = [{id: "cat_vanhoc", name: "Văn Học"}, {
        id: "cat_kynang",
        name: "Kỹ Năng Sống"
    }, {id: "cat_doisong", name: "Đời Sống"}, {id: "cat_kinhte", name: "Kinh Tế"}, {
        id: "cat_thieunhi",
        name: "Thiếu Nhi"
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
// --- KẾT THÚC DỮ LIỆU GIẢ ---

const BlogListItem = ({blog, onPress}) => {
    const publishedDate = new Date(blog.published_at);
    const formattedDate = `${publishedDate.getDate()}/${publishedDate.getMonth() + 1}/${publishedDate.getFullYear()}`;

    return (<TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-xl shadow-lg overflow-hidden mx-4 my-3 active:opacity-80"
    >
        <Image
            source={{uri: blog.thumbnail_url}}
            className="w-full h-52" // Tăng chiều cao ảnh thumbnail
            contentFit="cover"
            placeholder={{uri: 'https://via.placeholder.com/400x250/e0e0e0/999999?text=Blog'}}
            transition={300}
        />
        <View className="p-4">
            <Text
                className="text-xs text-blue-700 font-semibold uppercase tracking-wide">{blog.category.name}</Text>
            <Text className="text-xl font-bold text-gray-800 mt-1.5 leading-tight"
                  numberOfLines={2}>{blog.title}</Text>
            <Text className="text-sm text-gray-600 mt-2" numberOfLines={3}>{blog.excerpt}</Text>
            <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-200">
                <View className="flex-row items-center">
                    <MaterialCommunityIcons name="account-edit-outline" size={16} color="#4B5563"/>
                    <Text className="text-xs text-gray-700 ml-1.5 font-medium">{blog.author_name}</Text>
                </View>
                <View className="flex-row items-center">
                    <MaterialCommunityIcons name="calendar-clock-outline" size={16} color="#4B5563"/>
                    <Text className="text-xs text-gray-700 ml-1.5">{formattedDate}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>);
};

function BlogScreen() {
    const router = useRouter();

    const handleBlogPostPress = (blog) => {
        // Điều hướng đến BlogDetailScreen với slug của bài blog
        // File app/(app)/blog/[id].js sẽ nhận slug này như một param tên là 'id'
        router.push(`/blog/${blog.slug}`);
    };

    return (<View className="flex-1 bg-slate-100">
        {/* Header title được đặt trong app/(app)/blog/_layout.js */}
        <FlatList
            data={allFakeBlogs}
            renderItem={({item}) => (<BlogListItem
                blog={item}
                onPress={() => handleBlogPostPress(item)}
            />)}
            keyExtractor={item => item.blog_id}
            contentContainerStyle={{paddingVertical: 12}} // Thêm padding trên và dưới
            // ListHeaderComponent={ // Tiêu đề "Tin tức & Bài viết" đã có từ _layout.js
            //     <Text className="text-2xl font-bold text-gray-800 px-4 pt-4 pb-2">Tin tức & Bài viết</Text>
            // }
        />
    </View>);
}

export default BlogScreen;