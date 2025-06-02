import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// --- DỮ LIỆU GIẢ ---
// Trong ứng dụng thực tế, bạn sẽ fetch dữ liệu này từ API
const generateFakeProducts = (count = 10) => {
    const products = [];
    const bookTitles = ["Cuốn Theo Chiều Gió", "Nhà Giả Kim", "Đắc Nhân Tâm", "Harry Potter và Hòn Đá Phù Thủy", "Bố Già", "Rừng Na Uy", "Hoàng Tử Bé", "Tôi Thấy Hoa Vàng Trên Cỏ Xanh"];
    const authors = ["Margaret Mitchell", "Paulo Coelho", "Dale Carnegie", "J.K. Rowling", "Mario Puzo", "Haruki Murakami", "Antoine de Saint-Exupéry", "Nguyễn Nhật Ánh"];
    for (let i = 0; i < count; i++) {
        const original_price = Math.floor(Math.random() * 300 + 50) * 1000; // Giá từ 50k đến 350k
        const discount_percent = Math.random() < 0.7 ? Math.random() * 0.4 + 0.1 : 0; // 10-50% discount, 70% chance
        const sale_price = Math.floor(original_price * (1 - discount_percent) / 1000) * 1000;
        products.push({
            product_id: `book_${i + 1}`,
            title: bookTitles[i % bookTitles.length] + (count > bookTitles.length ? ` Tập ${Math.floor(i / bookTitles.length) + 1}` : ''),
            author: authors[i % authors.length],
            thumbnail_url: `https://picsum.photos/seed/book${i + Math.floor(Math.random() * 1000)}/200/300`, // Random seed for variety
            sale_price: sale_price,
            original_price: original_price,
            average_rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // Rating 3.5 - 5.0
            quantity_in_stock: Math.floor(Math.random() * 100),
        });
    }
    return products;
};

const generateFakeCategories = (count = 5) => {
    const categories = [];
    const names = ["Văn Học", "Kinh Tế", "Kỹ Năng Sống", "Thiếu Nhi", "Sách Nước Ngoài", "Lịch Sử"];
    const icons = ["book-open-page-variant", "finance", "account-heart", "human-child", "translate", "bank"];
    for (let i = 0; i < count; i++) {
        categories.push({
            category_id: `cat_${i + 1}`, name: names[i % names.length], icon: icons[i % icons.length], // Thêm icon cho danh mục
        });
    }
    return categories;
};

const generateFakeBlogs = (count = 3) => {
    const blogs = [];
    const titles = ["10 Cuốn Sách Nên Đọc Trong Hè Này", "Tìm Hiểu Về Tiểu Thuyết Hiện Đại", "Cách Rèn Luyện Thói Quen Đọc Sách Mỗi Ngày", "Những Tác Giả Trẻ Triển Vọng Của Năm",];
    for (let i = 0; i < count; i++) {
        blogs.push({
            blog_id: `blog_${i + 1}`,
            title: titles[i % titles.length],
            thumbnail_url: `https://picsum.photos/200`,
            excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
        });
    }
    return blogs;
};

const fakeProducts = generateFakeProducts(10);
const fakeCategories = generateFakeCategories(5);
const fakeBlogs = generateFakeBlogs(3);
// --- KẾT THÚC DỮ LIỆU GIẢ ---

const StarRating = ({ rating, size = 14 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (<View className="flex-row items-center">
        {[...Array(fullStars)].map((_, i) => <FontAwesome key={`full_${i}`} name="star" size={size}
            color="#FFC107" />)}
        {halfStar && <FontAwesome name="star-half-empty" size={size} color="#FFC107" />}
        {[...Array(emptyStars)].map((_, i) => <FontAwesome key={`empty_${i}`} name="star-o" size={size}
            color="#FFC107" />)}
        <Text className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</Text>
    </View>);
};

const ProductCard = ({ product }) => {
    return (<TouchableOpacity className="bg-white rounded-lg shadow-md p-3 m-2 w-40 overflow-hidden">
        <Image
            source={{ uri: product.thumbnail_url }}
            className="w-full h-48 rounded-md"
            contentFit="cover"
            placeholder={{ uri: 'https://picsum.photos/200' }}
            transition={300}
        />
        <Text className="text-sm font-semibold mt-2 text-gray-800" numberOfLines={2}>{product.title}</Text>
        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>{product.author}</Text>
        <View className="mt-1">
            <Text className="text-sm font-bold text-blue-600">
                {product.sale_price.toLocaleString('vi-VN')}₫
            </Text>
            {product.original_price > product.sale_price && (<Text className="text-xs text-gray-400 line-through">
                {product.original_price.toLocaleString('vi-VN')}₫
            </Text>)}
        </View>
        <View className="mt-1">
            <StarRating rating={product.average_rating} />
        </View>
    </TouchableOpacity>);
};

const CategoryChip = ({ category, onPress }) => {
    return (<TouchableOpacity
        onPress={onPress}
        className="bg-sky-100 rounded-lg p-3 m-1.5 items-center w-24 h-24 justify-center shadow"
    >
        <MaterialCommunityIcons name={category.icon || "tag"} size={28} color="#0369A1" />
        <Text className="text-xs text-sky-700 font-medium mt-1.5 text-center"
            numberOfLines={2}>{category.name}</Text>
    </TouchableOpacity>);
};

const BlogPostItem = ({ post, onPress }) => {
    return (<TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-lg shadow p-3 mx-4 mb-3 flex-row items-start"
    >
        <Image
            source={{ uri: post.thumbnail_url }}
            className="w-24 h-24 rounded-md mr-3"
            contentFit="cover"
            placeholder={{ uri: 'https://picsum.photos/200' }}
            transition={300}
        />
        <View className="flex-1">
            <Text className="text-md font-semibold text-gray-800" numberOfLines={2}>{post.title}</Text>
            <Text className="text-xs text-gray-600 mt-1" numberOfLines={3}>{post.excerpt}</Text>
            <Text className="text-xs text-blue-600 mt-1.5 font-medium">Đọc thêm</Text>
        </View>
    </TouchableOpacity>);
};

const PromotionalBanner = ({ title, subtitle, imageUrl, ctaText, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} className="mx-4 my-4 rounded-xl overflow-hidden shadow-lg aspect-[16/7]">
            <Image source={{ uri: imageUrl }} className="absolute inset-0 w-full h-full" contentFit="cover" />
            <View className="absolute inset-0 bg-black/40 p-4 flex justify-end">
                <Text className="text-white text-xl font-bold shadow-black" style={{
                    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2
                }}>{title}</Text>
                <Text className="text-gray-200 text-sm mt-0.5 shadow-black" style={{
                    textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2
                }}>{subtitle}</Text>
                {ctaText && (<View className="mt-2 self-start bg-white/90 px-3 py-1.5 rounded-md shadow">
                    <Text className="text-blue-700 font-semibold text-xs">{ctaText}</Text>
                </View>)}
            </View>
        </TouchableOpacity>);
};


function HomeScreen() {
    // Hàm xử lý khi nhấn vào một item, bạn có thể điều hướng ở đây
    const handleProductPress = (product) => console.log("Pressed product:", product.title);
    const handleCategoryPress = (category) => console.log("Pressed category:", category.name);
    const handleBlogPostPress = (post) => console.log("Pressed blog post:", post.title);
    const handleBannerPress = () => console.log("Banner pressed");

    return (<ScrollView className="flex-1 bg-slate-50">
        {/* Welcome Section */}
        <View className="p-5 bg-sky-600">
            <Text className="text-2xl font-bold text-white">Chào mừng trở lại!</Text>
            <Text className="text-sm text-sky-100 mt-1">Khám phá những cuốn sách yêu thích của bạn.</Text>
        </View>

        {/* Promotional Banner Section */}
        <PromotionalBanner
            title="Ưu Đãi Mùa Hè!"
            subtitle="Giảm giá đến 50% cho hàng ngàn đầu sách."
            imageUrl="https://picsum.photos/seed/summerbooks/800/350"
            ctaText="Xem Ngay"
            onPress={handleBannerPress}
        />

        {/* Featured Products Section */}
        <View className="my-3">
            <View className="flex-row justify-between items-center px-4 mb-1">
                <Text className="text-xl font-semibold text-gray-800">Sách Mới Nhất</Text>
                <TouchableOpacity onPress={() => console.log("View all new products")}>
                    <Text className="text-sm text-blue-600 font-medium">Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={fakeProducts.slice(0, 6)}
                renderItem={({ item }) => <ProductCard product={item} />}
                keyExtractor={item => item.product_id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}
            />
        </View>

        {/* Categories Section */}
        <View className="my-3">
            <View className="flex-row justify-between items-center px-4 mb-1">
                <Text className="text-xl font-semibold text-gray-800">Danh Mục Nổi Bật</Text>
                <TouchableOpacity onPress={() => console.log("View all categories")}>
                    <Text className="text-sm text-blue-600 font-medium">Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={fakeCategories}
                renderItem={({ item }) => <CategoryChip category={item} onPress={() => handleCategoryPress(item)} />}
                keyExtractor={item => item.category_id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}
            />
        </View>

        {/* Best Sellers Section (Ví dụ thêm) */}
        <View className="my-3">
            <View className="flex-row justify-between items-center px-4 mb-1">
                <Text className="text-xl font-semibold text-gray-800">Sách Bán Chạy</Text>
                <TouchableOpacity onPress={() => console.log("View all best sellers")}>
                    <Text className="text-sm text-blue-600 font-medium">Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={[...fakeProducts].sort((a, b) => b.average_rating - a.average_rating).slice(0, 6)} // Sắp xếp theo rating
                renderItem={({ item }) => <ProductCard product={item} />}
                keyExtractor={item => `bestseller_${item.product_id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8 }}
            />
        </View>


        {/* Latest Blog Posts Section */}
        <View className="my-3 pb-4">
            <View className="flex-row justify-between items-center px-4 mb-2">
                <Text className="text-xl font-semibold text-gray-800">Tin Tức & Bài Viết</Text>
                <TouchableOpacity onPress={() => console.log("View all blog posts")}>
                    <Text className="text-sm text-blue-600 font-medium">Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            {fakeBlogs.map(post => (
                <BlogPostItem key={post.blog_id} post={post} onPress={() => handleBlogPostPress(post)} />))}
        </View>
    </ScrollView>);
}

export default HomeScreen;
