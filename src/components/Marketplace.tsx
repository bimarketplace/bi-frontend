"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Product as ProductType } from "@/lib/products";
import { Category } from "@/lib/categories";
import toast from "react-hot-toast";
import Tabs from '@/components/Tabs';

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
  const paddingTopClass = (isMounted && isLoggedIn && !isVerified) ? 'pt-[125px]' : 'pt-20';

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className={`transition-all duration-300 ${paddingTopClass} pb-16 px-4 sm:px-8`}>
        <Tabs productsProps={{ initialProducts, categories, initialNext, initialPrev, initialCount }} />     
      </main>
    </div>
  );
}
