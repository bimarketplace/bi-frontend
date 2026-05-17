"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Product as ProductType, FlashSale as FlashSaleType } from "@/lib/products";
import { Category } from "@/lib/categories";
import Products from '@/components/Products';
import { Container } from './layout/Container';
import Hero from "@/components/Hero";
import ProductModal from "@/components/ProductModal";

export default function Marketplace({ 
  initialProducts, 
  categories, 
  initialNext, 
  initialPrev, 
  initialCount,
  initialFlashSales
}: { 
  initialProducts: ProductType[] | null | undefined; 
  categories: Category[] | null | undefined; 
  initialNext?: string | null; 
  initialPrev?: string | null; 
  initialCount?: number; 
  initialFlashSales?: FlashSaleType[];
}) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const user = session?.user;
  const isLoggedIn = !!session;
  const isVerified = (user as any)?.is_verified ?? (user as any)?.email_verified ?? true;

  // Use server-side default padding first to avoid hydration mismatch
  const paddingTopClass = (isMounted && isLoggedIn && !isVerified) ? 'pt-[170px] md:pt-[125px]' : 'pt-[130px] md:pt-20';

  const heroProducts = initialProducts || [];
  const flashSales = initialFlashSales || [];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Container as="main" className={`transition-all duration-300 ${paddingTopClass} pb-16`}>
        <h1 className="sr-only">BI Marketplace - Buy and Sell Products Effectively</h1>
        <Hero products={heroProducts} flashSales={flashSales} onProductClick={setSelectedProduct} />
        <Products 
          initialProducts={initialProducts}
          categories={categories}
          initialNext={initialNext}
          initialPrev={initialPrev}
          initialCount={initialCount}
        />     
      </Container>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          showAddToCart={false}
        />
      )}
    </div>
  );
}
