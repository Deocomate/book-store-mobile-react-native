import BlogDetailScreen from "@/screens/blog/BlogDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function BlogDetailRoute() {
  const { id } = useLocalSearchParams()
  return <BlogDetailScreen id={id} />;
} 