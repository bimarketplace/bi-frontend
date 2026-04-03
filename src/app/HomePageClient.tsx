"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ThumbsUpIcon, ThumbsDownIcon, Message01Icon, Search01Icon, GridIcon, ArrowRight01Icon, ArrowLeft02Icon, ArrowRight02Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/layout/Navbar";
import { useGrid } from "@/context/GridContext";
import { Category } from "@/lib/categories";
import { fetchProductsPage, Product as ProductType } from "@/lib/products";

// Simple Alert icon component
const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Empty state component
const EmptyState = ({ message = "No products available" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="bg-gray-100 rounded-full p-6 mb-4">
      <AlertIcon />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{message}</h3>
    <p className="text-sm text-gray-500">Check back later for new products</p>
  </div>
);

// Product type is imported from '@/lib/products' as ProductType

// Product card component with proper typing
interface ProductCardProps {
  product: ProductType;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { columns } = useGrid();

  // Define responsive styles based on grid columns
  const isCompact = typeof columns === 'number' && columns >= 2;
  const isMini = typeof columns === 'number' && columns >= 3;

  return (
<div
  onClick={() => router.push(`/products/${product.id}`)}
  className="group relative w-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full cursor-pointer"
>
  {/* Image Container */}
  <div className="relative aspect-[16/9.5] overflow-hidden bg-gray-50">
    <Image
      src={product.image_url || "/assets/images/sale-fast.png"}
      alt={product.name}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-110"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/assets/images/placeholder.png";
      }}
    />

    {/* Elegant Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/10 to-primary-950/80" />
    
    {/* Price Badge - Floating on Image */}
    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-2xl font-black text-lg shadow-lg border border-black/5 text-zinc-950">
      ₦{parseFloat(product.price || "0").toLocaleString()}
    </div>
  </div>

  {/* Content Area */}
  <div className="flex-1 p-6 flex flex-col">
    {/* Product Name - Strong and Clear */}
    <h3 className={`font-black tracking-tight text-gray-950 line-clamp-2 leading-tight mb-4
      ${isMini ? 'text-base' : isCompact ? 'text-[17px]' : 'text-xl'}`}>
      {product.name}
    </h3>

    {/* Seller - Smaller and Beneath */}
    {!isMini && (
      <div className="flex items-center gap-2.5">
        <Avatar 
          name={product.seller?.username || 'Unknown'} 
          size="sm" 
          variant="light"
          className="ring-1 ring-gray-100"
        />
        <p className="text-gray-500 text-[13px] truncate font-bold">
          {product.seller?.username || 'Unknown Seller'}
        </p>
      </div>
    )}

    {/* Description */}
    {!isMini && (
      <p className={`mt-4 text-gray-600 leading-relaxed line-clamp-3
        ${isCompact ? 'text-sm' : 'text-[15px]'}`}>
        {product.description}
      </p>
    )}

    {/* Bottom Section */}
    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-7 text-gray-500">
        {/* Likes */}
        <div className="flex items-center gap-2">
          <div className="text-primary-500">
            <ThumbsUpIcon size={isMini ? 17 : 20} />
          </div>
          <span className="font-semibold text-sm tracking-tight">
            {product.vote_score || 0}
          </span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-2">
          <Message01Icon size={isMini ? 17 : 20} />
          <span className="font-semibold text-sm tracking-tight">
            {product.comments?.length || 0}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default function HomePageClient({ initialProducts, categories, initialNext, initialPrev, initialCount }: { initialProducts: ProductType[] | null | undefined; categories: Category[] | null | undefined; initialNext?: string | null; initialPrev?: string | null; initialCount?: number; }) {
  const { data: session } = useSession();
  const { columns, toggleColumns } = useGrid();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const normalizedCategories = Array.isArray(categories) ? categories : [];
  const normalizedInitialProducts = Array.isArray(initialProducts) ? initialProducts : [];

  const [products, setProducts] = useState<ProductType[]>(normalizedInitialProducts);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialNext ?? null);
  const [totalCount, setTotalCount] = useState<number>(initialCount ?? 0);

  const [isInitialLoading, setIsInitialLoading] = useState(normalizedInitialProducts.length === 0);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const user = session?.user;
  const isLoggedIn = !!session;
  const isVerified = (user as any)?.is_verified ?? (user as any)?.email_verified ?? true;

  const filteredProducts = products.filter((product) => {
    const lowerSearch = search.toLowerCase();
    const matchesSearch = product.name?.toLowerCase().includes(lowerSearch) ||
      product.description?.toLowerCase().includes(lowerSearch) ||
      product.seller?.username?.toLowerCase().includes(lowerSearch);

    const matchesCategory = selectedCategoryId === null || product.category?.id === selectedCategoryId;

    return matchesSearch && matchesCategory;
  });

  const getPageNumberFromUrl = (url: string | null): number => {
    if (!url) return 1;
    try {
      const parsed = new URL(url);
      const page = parsed.searchParams.get("page");
      return page ? parseInt(page, 10) : 1;
    } catch {
      return 1;
    }
  };

  const getInitialCurrentPage = () => {
    if (initialPrev) {
      return getPageNumberFromUrl(initialPrev) + 1;
    }
    if (initialNext) {
      return Math.max(getPageNumberFromUrl(initialNext) - 1, 1);
    }
    return 1;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialCurrentPage);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!nextPageUrl || isFetchingPage) return;
    setIsFetchingPage(true);
    setPageError(null);

    try {
      const response = await fetchProductsPage(nextPageUrl);
      setProducts(prev => [...prev, ...response.results]);
      setNextPageUrl(response.next);
      setTotalCount(response.count);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error("Failed to load more products:", error);
      setPageError("Unable to load products. Please try again.");
    } finally {
      setIsFetchingPage(false);
    }
  }, [nextPageUrl, isFetchingPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageUrl && !isFetchingPage) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextPageUrl, isFetchingPage, loadMore]);



  const isEmptyState = !isInitialLoading && products.length === 0;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <main className={`transition-all duration-300 ${isLoggedIn && !isVerified ? 'pt-[125px]' : 'pt-20'} pb-16 px-4 sm:px-8`}>
        <div className="my-8 flex justify-center items-center gap-3 w-full max-w-lg mx-auto">
          <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-all duration-300">
              <Search01Icon size={20} />
            </div>
            <input
              type="text"
              placeholder="Search products, sellers or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-primary-100 focus:outline-none focus:ring-[6px] focus:ring-primary-500/10 focus:border-primary-400 transition-all duration-500 placeholder:text-gray-400 font-medium shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)]"
            />
          </div>
          
          <button 
            onClick={toggleColumns}
            className="sm:hidden p-3.5 bg-white rounded-2xl border border-primary-100 text-gray-500 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            title="Toggle layout"
          >
            <GridIcon size={20} />
            <span className="text-[11px] font-extrabold">{columns}</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Most popular categories
            </h2>
            <div className="hidden sm:flex gap-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('categories-scroll');
                  if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                }}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all"
              >
                <ArrowLeft02Icon size={20} />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('categories-scroll');
                  if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                }}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all"
              >
                <ArrowRight02Icon size={20} />
              </button>
            </div>
          </div>

          <div 
            id="categories-scroll"
            className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
          >
            {/* All Products Card */}
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`flex-none w-[280px] p-4 rounded-[20px] border transition-all duration-300 flex items-center gap-4 text-left group
                ${selectedCategoryId === null
                  ? "bg-white border-[#008000] shadow-[0_8px_30px_rgba(0,128,0,0.08)]"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                }`}
            >
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-colors
                ${selectedCategoryId === null ? "bg-[#008000]/5 text-[#008000]" : "bg-gray-50 text-gray-400"}`}>
                <GridIcon size={24} />
              </div>
              <span className={`font-bold transition-colors ${selectedCategoryId === null ? "text-[#008000]" : "text-gray-800"}`}>
                All Products
              </span>
              <div className={`ml-auto transition-all ${selectedCategoryId === null ? "text-[#008000] translate-x-1" : "text-gray-300 transform group-hover:translate-x-1 group-hover:text-gray-400"}`}>
                <ArrowRight01Icon size={20} />
              </div>
            </button>

            {normalizedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`flex-none w-[280px] p-4 rounded-[20px] border transition-all duration-300 flex items-center gap-4 text-left group
                  ${selectedCategoryId === category.id
                    ? "bg-white border-[#008000] shadow-[0_8px_30px_rgba(0,128,0,0.08)]"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                  }`}
              >
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center overflow-hidden transition-colors
                  ${selectedCategoryId === category.id ? "bg-[#008000]/5" : "bg-gray-50"}`}>
                  {category.image_url ? (
                    <div className="relative w-7 h-7">
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <GridIcon size={24} className={selectedCategoryId === category.id ? "text-[#008000]" : "text-gray-400"} />
                  )}
                </div>
                <span className={`font-bold transition-colors line-clamp-1 ${selectedCategoryId === category.id ? "text-[#008000]" : "text-gray-800"}`}>
                  {category.name}
                </span>
                <div className={`ml-auto transition-all ${selectedCategoryId === category.id ? "text-[#008000] translate-x-1" : "text-gray-300 transform group-hover:translate-x-1 group-hover:text-gray-400"}`}>
                  <ArrowRight01Icon size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10">
          {pageError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {pageError}
            </div>
          )}

          {isInitialLoading ? (
            <div className={`grid gap-4 justify-items-center ${
              columns === 1 ? 'grid-cols-1' :
              columns === 2 ? 'grid-cols-2' :
              columns === 3 ? 'grid-cols-3' :
              columns === 4 ? 'grid-cols-4' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            } w-full`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="w-full rounded-[12px] bg-white border border-gray-200/40 shadow-sm p-4 animate-pulse">
                  <div className="h-28 bg-gray-200 rounded-md mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : isEmptyState ? (
            <EmptyState message="No matching products found" />
          ) : (
            <>
              <div className={`grid gap-4 justify-items-center transition-all duration-300 ${
                columns === 1 ? 'grid-cols-1' : 
                columns === 2 ? 'grid-cols-2' : 
                columns === 3 ? 'grid-cols-3' :
                columns === 4 ? 'grid-cols-4' :
                'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              } w-full`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div ref={observerTarget} className="mt-8 w-full flex justify-center pb-8">
                {isFetchingPage && (
                  <div className={`grid gap-4 justify-items-center transition-all duration-300 ${
                    columns === 1 ? 'grid-cols-1' :
                    columns === 2 ? 'grid-cols-2' :
                    columns === 3 ? 'grid-cols-3' :
                    columns === 4 ? 'grid-cols-4' :
                    'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  } w-full`}>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="w-full rounded-[12px] bg-white border border-gray-200/40 shadow-sm p-4 animate-pulse">
                        <div className="h-28 bg-gray-200 rounded-md mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                        <div className="h-8 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
