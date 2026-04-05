"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FavouriteIcon, StarIcon, ThumbsUpIcon, ThumbsDownIcon, Message01Icon, Search02Icon, GridIcon, ArrowRight01Icon, ArrowLeft02Icon, ArrowRight02Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/layout/Navbar";
import { useGrid } from "@/context/GridContext";
import { Category } from "@/lib/categories";
import { fetchProductsPage, Product as ProductType } from "@/lib/products";
import toast from "react-hot-toast";
import Tabs from '@/components/Tabs';

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
      className="group relative w-full bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={product.image_url || "/assets/images/sale-fast.png"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/assets/images/placeholder.png";
          }}
        />

        {/* Favourite Icon */}
        {/* <button 
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite logic
          }}
        >
          <FavouriteIcon size={18} />
        </button> */}

        {/* Video Icon Mockup (like Fiverr) */}
        {/* <div className="absolute bottom-3 left-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white">
          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
        </div> */}

        {/* Pagination Dots Mockup */}
        {/* <div className="absolute bottom-3 right-0 left-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-white' : 'bg-white/50'}`} />
          ))}
        </div> */}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 flex flex-col gap-2">

        {/* Gig Title / Name */}
        <h3 className="text-[15px] font-normal text-gray-900 line-clamp-2 leading-snug hover:underline">
          {product.name}
        </h3>


        {/* Rating */}
        {/* <div className="flex items-center gap-1">
          <StarIcon size={14} className="fill-gray-900 text-gray-900" />
          <span className="text-sm font-bold text-gray-900">5.0</span>
          <span className="text-sm text-gray-500">({product.vote_score || 0})</span>
        </div> */}

        {/* Price Section */}
        <div className="mt-auto pt-2 flex flex-col">
          {/* <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            From
          </div> */}
          <div className="text-lg font-bold text-gray-900">
            ₦{parseFloat(product.price || "0").toLocaleString()}
          </div>
        </div>
        {/* Seller Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              {/* <Avatar 
                name={product.seller?.username || 'U'} 
                size="xs"
                variant="light"
                className="ring-1 ring-gray-100"
              /> */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
              {product.seller?.username || 'Seller'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Products({ initialProducts, categories, initialNext, initialPrev, initialCount }: { initialProducts: ProductType[] | null | undefined; categories: Category[] | null | undefined; initialNext?: string | null; initialPrev?: string | null; initialCount?: number; }) {
  const { data: session } = useSession();
  const { columns, toggleColumns } = useGrid();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const normalizedCategories = Array.isArray(categories) ? categories : [];
  const normalizedInitialProducts = Array.isArray(initialProducts) ? initialProducts : [];

  const [products, setProducts] = useState<ProductType[]>(normalizedInitialProducts);
  const [categoriesState, setCategoriesState] = useState<Category[]>(normalizedCategories);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialNext ?? null);
  const [totalCount, setTotalCount] = useState<number>(initialCount ?? 0);

  const [isInitialLoading, setIsInitialLoading] = useState(normalizedInitialProducts.length === 0 && (!categories || categories.length === 0));
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Initial fetch if props are missing
  useEffect(() => {
    const fetchInitialData = async () => {
      if (normalizedInitialProducts.length > 0 || (categories && categories.length > 0)) {
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProductsPage(),
          import("@/lib/categories").then(m => m.fetchCategories())
        ]);

        setProducts(productsData.results);
        setCategoriesState(categoriesData);
        setNextPageUrl(productsData.next);
        setTotalCount(productsData.count);
      } catch (error) {
        console.error("Failed to fetch initial products:", error);
        setPageError("Failed to load products. Please refresh.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [normalizedInitialProducts.length, categories]);

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

  // Welcome notification on initial login
  useEffect(() => {
    if (isLoggedIn) {
      toast.success(`Welcome back, ${user?.name || (user as any)?.username || 'User'}!`, {
        icon: '👋',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#008000',
          color: '#fff',
        },
      });
    }
  }, [isLoggedIn, user]);



  const isEmptyState = !isInitialLoading && products.length === 0;

  return (
    <div className="w-full">
                      <div className="pb-16 px-4 sm:px-8">
                      {/* Search Bar Container */}
                      <div className="flex items-center w-full max-w-2xl bg-white rounded-lg sm:rounded-xl p-1 shadow-2xl group-within:ring-4 group-within:ring-white/10 transition-all h-[52px] sm:h-[58px] overflow-hidden">
                        <input
                          type="text"
                          placeholder="Search for any service..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="flex-1 px-4 text-zinc-800 placeholder:text-zinc-400 focus:outline-none font-medium bg-transparent text-[14px] sm:text-base h-full"
                        />
                        <button 
                          id="search-button"
                          className="text-black px-5 h-full rounded-md sm:rounded-lg hover:bg-zinc-800 transition-all flex items-center justify-center shrink-0"
                          aria-label="Search"
                        >
                          <Search02Icon size={20} />
                        </button>
                      </div>
        {/* Categories Bar */}
        <div className="max-w-6xl mx-auto mb-5">
          <div className="flex justify-end items-end mb-6">
            {/* <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Most popular categories
            </h2> */}
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
              className={`flex-none w-fit py-2 px-4 rounded-full border transition-all duration-300 flex items-center gap-3 text-left group
                ${selectedCategoryId === null
                  ? "text-white bg-[#008000] shadow-[0_4px_15px_rgba(0,128,0,0.1)]"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
            >
              {/* <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors
                ${selectedCategoryId === null ? "bg-[#008000]/5 text-[#008000]" : "bg-gray-100 text-gray-500"}`}>
                <GridIcon size={14} />
              </div> */}
              <span className={`text-[12px] font-medium transition-colors ${selectedCategoryId === null ? "text-white" : "text-gray-700"}`}>
                All Products
              </span>
              {/* <div className={`ml-auto transition-all ${selectedCategoryId === null ? "text-[#008000] translate-x-1" : "text-gray-300"}`}>
                <ArrowRight01Icon size={16} />
              </div> */}
            </button>

            {categoriesState.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`flex-none w-fit py-2 px-4 rounded-full border transition-all duration-300 flex items-center gap-3 text-left group
                  ${selectedCategoryId === category.id
                    ? "text-white bg-[#008000] shadow-[0_4px_15px_rgba(0,128,0,0.1)]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
              >
                <span className={`text-[12px] font-medium transition-colors ${selectedCategoryId === category.id ? "text-white" : "text-gray-700"}`}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-5">
          {pageError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {pageError}
            </div>
          )}

          {isInitialLoading ? (
            <div className={`grid gap-4 justify-items-center grid-cols-2 lg:grid-cols-4 w-full`}>
              {Array.from({ length: 8 }).map((_, index) => (
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
              <div className={`grid gap-4 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 w-full`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div ref={observerTarget} className="mt-8 w-full flex justify-center pb-8">
                {isFetchingPage && (
                  <div className={`grid gap-4 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 w-full`}>
                    {Array.from({ length: 4 }).map((_, index) => (
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
      </div>
    </div>
  );
}
