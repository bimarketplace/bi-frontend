import React, { Suspense } from "react";
import HomePageClient from "./HomePageClient";
import { fetchProductsPage, fetchActiveFlashSales, Product, FlashSale } from "@/lib/products";
import { fetchCategories, Category } from "@/lib/categories";
import Marketplace from "@/components/Marketplace"

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home() {
  let products: Product[] = [];
  let nextPage: string | null = null;
  let prevPage: string | null = null;
  let totalCount = 0;
  let categories: Category[] = [];
  let flashSales: FlashSale[] = [];
  
  try {
    const [productsData, categoriesData, flashSalesData] = await Promise.all([
      fetchProductsPage(),
      fetchCategories(),
      fetchActiveFlashSales()
    ]);
    products = productsData.results;
    nextPage = productsData.next;
    prevPage = productsData.previous;
    totalCount = productsData.count;
    categories = categoriesData;
    flashSales = flashSalesData;
  } catch (error: any) {
    console.error("Failed to fetch initial data on server:", error);
    // Try fallback...
  }

  return (
    <Suspense fallback={<div>Loading marketplace...</div>}>
      <Marketplace 
        initialProducts={products} 
        initialPrev={prevPage} 
        initialNext={nextPage} 
        initialCount={totalCount} 
        categories={categories} 
        initialFlashSales={flashSales}
      />
    </Suspense>
  );
}