// src/app/(app)/product/reviews.js
import ProductReviewsScreen from "@/screens/product/ProductReviewsScreen";
import { useLocalSearchParams } from "expo-router";

export default function ProductReviewsRoute() {
    const { productId } = useLocalSearchParams(); // Lấy productId từ params
    return <ProductReviewsScreen productId={productId} />;
}