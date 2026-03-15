import HomePageClient from "./HomePageClient";
import { fetchProducts } from "@/lib/products";

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home() {
  let products = [];
  try {
    products = await fetchProducts();
  } catch (error) {
    console.error("Failed to fetch products on server:", error);
  }

  return <HomePageClient initialProducts={products} />;
}