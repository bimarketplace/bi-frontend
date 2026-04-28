"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Product as ProductType } from "@/lib/products";
import { Category } from "@/lib/categories";
import Products from '@/components/Products';
import { Container } from './layout/Container';

export default function Marketplace({ initialProducts, categories, initialNext, initialPrev, initialCount }: { initialProducts: ProductType[] | null | undefined; categories: Category[] | null | undefined; initialNext?: string | null; initialPrev?: string | null; initialCount?: number; }) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const user = session?.user;
  const isLoggedIn = !!session;
  const isVerified = (user as any)?.is_verified ?? (user as any)?.email_verified ?? true;

  // Use server-side default padding first to avoid hydration mismatch
  const paddingTopClass = (isMounted && isLoggedIn && !isVerified) ? 'pt-[170px] md:pt-[125px]' : 'pt-[130px] md:pt-20';

  return (
    <div className="min-h-screen bg-white font-sans">
      <Container as="main" className={`transition-all duration-300 ${paddingTopClass} pb-16`}>
        <h1 className="sr-only">BI Marketplace - Buy and Sell Products Effectively</h1>
        <Products 
          initialProducts={initialProducts}
          categories={categories}
          initialNext={initialNext}
          initialPrev={initialPrev}
          initialCount={initialCount}
        />     
      </Container>
    </div>
  );
}
