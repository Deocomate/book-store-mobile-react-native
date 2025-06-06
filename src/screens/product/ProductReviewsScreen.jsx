// src/screens/product/ProductReviewsScreen.jsx
import { productService } from '@/services';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, Text, View } from 'react-native';

const StarRating = ({ rating, size = 16, color = "#FFC107", showText = true }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.4;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <View className="flex-row items-center">
            {[...Array(fullStars)].map((_, i) => <FontAwesome key={`full_${i}`} name="star" size={size} color={color} />)}
            {halfStar && <FontAwesome name="star-half-empty" size={size} color={color} />}
            {[...Array(emptyStars)].map((_, i) => <FontAwesome key={`empty_${i}`} name="star-o" size={size} color={color} />)}
            {showText && <Text className="text-sm text-gray-600 ml-2">{rating ? rating.toFixed(1) : 'Mới'}</Text>}
        </View>
    );
};

const ReviewItem = React.memo(({ review }) => {
    const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A';
    return (
        <View className="bg-white p-4 mb-3 mx-3 rounded-lg shadow">
            <View className="flex-row justify-between items-center mb-1">
                {/* userId từ backend là dạng number, không có username */}
                <Text className="font-semibold text-gray-700">{review.username}</Text>
                <StarRating rating={review.vote} size={14} showText={false} />
            </View>
            <Text className="text-xs text-gray-500 mb-2">{reviewDate}</Text>
            <Text className="text-gray-700 leading-relaxed">{review.comment || "Không có bình luận."}</Text>
        </View>
    );
});

function ProductReviewsScreen({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const fetchReviews = useCallback(async (page = 1, isRefreshing = false) => {
        if (!productId) {
            setError("Không có ID sản phẩm để tải đánh giá.");
            setLoading(false);
            return;
        }
        if (!isRefreshing && page > 1 && page > totalPages) return; // Stop if no more pages

        if (page === 1) setLoading(true);
        else if (!isRefreshing) setLoadingMore(true);
        setError(null);

        try {
            const response = await productService.getRatesByProductId(productId, page, pageSize);
            if (response && response.status === 200 && response.result) {
                const newReviews = response.result.data || [];
                setReviews(prev => (page === 1 ? newReviews : [...prev, ...newReviews]));
                setTotalPages(response.result.totalPages || 1);
                setPageIndex(page);
            } else {
                throw new Error(response?.message || "Không thể tải đánh giá sản phẩm.");
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError(err.message || "Đã xảy ra lỗi khi tải đánh giá.");
            if (page === 1) setReviews([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            if (isRefreshing) setRefreshing(false);
        }
    }, [productId, totalPages]);

    useEffect(() => {
        fetchReviews(1, true); // Fetch initial data on mount
    }, [fetchReviews]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReviews(1, true);
    };

    const loadMoreReviews = () => {
        if (!loading && pageIndex < totalPages) {
            fetchReviews(pageIndex + 1);
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#0EA5E9" />;
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0EA5E9" />
            </SafeAreaView>
        );
    }

    if (error && reviews.length === 0) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-100 p-5">
                <Ionicons name="cloud-offline-outline" size={70} color="#CBD5E1" />
                <Text className="text-xl font-semibold text-gray-700 mt-4">Lỗi tải đánh giá</Text>
                <Text className="text-gray-500 mt-1 text-center mb-3">{error}</Text>
            </SafeAreaView>
        );
    }

    if (reviews.length === 0 && !loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-slate-100 p-5">
                <Ionicons name="star-outline" size={70} color="#CBD5E1" />
                <Text className="text-xl font-semibold text-gray-700 mt-4">Chưa có đánh giá nào</Text>
                <Text className="text-gray-500 mt-1 text-center">
                    Hãy là người đầu tiên đánh giá sản phẩm này!
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <FlatList
                data={reviews}
                renderItem={({ item }) => <ReviewItem review={item} />}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 0, paddingBottom: 20 }}
                onEndReached={loadMoreReviews}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0EA5E9"]} tintColor={"#0EA5E9"} />
                }
            />
        </SafeAreaView>
    );
}

export default ProductReviewsScreen;