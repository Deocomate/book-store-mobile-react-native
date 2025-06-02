import ProductDetailScreen from "@/screens/product/ProductDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function ProductDetailRoute() {
    const { id } = useLocalSearchParams()
    return <ProductDetailScreen id={id} />;
}