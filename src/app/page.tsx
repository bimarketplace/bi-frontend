import HomePageClient from "./HomePageClient";
import { fetchProducts } from "@/lib/products";
import { fetchCategories, Category } from "@/lib/categories";

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home() {
  let products = [];
  let categories: Category[] = [];
  
  try {
    const [productsData, categoriesData] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);
    products = productsData;
    categories = categoriesData;
  } catch (error) {
    console.error("Failed to fetch initial data on server:", error);
    // Try to at least get products if categories fail
    if (products.length === 0) {
      try {
        products = await fetchProducts();
      } catch (e) {
        console.error("Critical failure fetching products:", e);
      }
    }
  }

  return <HomePageClient initialProducts={products} categories={categories} />;
}