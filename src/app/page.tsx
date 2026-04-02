import HomePageClient from "./HomePageClient";
import { fetchProductsPage, Product } from "@/lib/products";
import { fetchCategories, Category } from "@/lib/categories";

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home() {
  let products: Product[] = [];
  let nextPage: string | null = null;
  let prevPage: string | null = null;
  let totalCount = 0;
  let categories: Category[] = [];
  
  try {
    const [productsData, categoriesData] = await Promise.all([
      fetchProductsPage(),
      fetchCategories()
    ]);
    products = productsData.results;
    nextPage = productsData.next;
    prevPage = productsData.previous;
    totalCount = productsData.count;
    categories = categoriesData;
  } catch (error) {
    console.error("Failed to fetch initial data on server:", error);
    // Try to at least get products if categories fail
    if (products.length === 0) {
      try {
        const fallback = await fetchProductsPage();
        products = fallback.results;
        nextPage = fallback.next;
        prevPage = fallback.previous;
        totalCount = fallback.count;
      } catch (e) {
        console.error("Critical failure fetching products:", e);
      }
    }
  }

  return <HomePageClient initialProducts={products} initialPrev={prevPage} initialNext={nextPage} initialCount={totalCount} categories={categories} />;
}