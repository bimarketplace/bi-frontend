import React, { Suspense } from "react";
import HomePageClient from "./HomePageClient";
import { fetchProductsPage, fetchActiveFlashSales, Product, FlashSale } from "@/lib/products";
import { fetchCategories, Category } from "@/lib/categories";
import Marketplace from "@/components/Marketplace";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate the page every 60 seconds

export const metadata: Metadata = {
  title: "BI - The Ultimate Marketplace",
  description: "Discover BI, the ultimate marketplace for all your products. Shop from a wide range of verified sellers, enjoy secure payments, fast delivery, and top-notch customer support.",
  openGraph: {
    title: "BI - The Ultimate Marketplace",
    description: "Discover BI, the ultimate marketplace for all your products. Shop from verified sellers.",
    url: "/",
    siteName: "BI Marketplace",
    images: [
      {
        url: "/icon512_rounded.png",
        width: 512,
        height: 512,
        alt: "BI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BI - The Ultimate Marketplace",
    description: "Discover BI, the ultimate marketplace for all your products.",
    images: ["/icon512_rounded.png"],
  },
};

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