"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FavouriteIcon, StarIcon, ThumbsUpIcon, ThumbsDownIcon, Message01Icon, Search02Icon, GridIcon, ArrowRight01Icon, ArrowLeft02Icon, ArrowRight02Icon } from "hugeicons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { useGrid } from "@/context/GridContext";
import { Category } from "@/lib/categories";
import { fetchProductsPage, Product as ProductType } from "@/lib/products";
import toast from "react-hot-toast";

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

const HeroCarousel = ({ products }: { products: ProductType[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (!products || products.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-[#008000] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {products.map((product, index) => (
        <div
          key={product.id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={product.image_url || "/assets/images/sale-fast.png"}
            alt={product.name || "Product"}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/assets/images/placeholder.png";
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <h3 className="text-white font-bold text-lg line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
                <Avatar name={product.seller?.username || 'U'} size="xs" variant="light" className="ring-1 ring-white/20" />
                <span className="text-white/90 font-medium text-sm">
                    {product.seller?.username || 'Seller'} • ₦{parseFloat(product.price || "0").toLocaleString()}
                </span>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {products.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all shadow-sm ${
              idx === currentIndex ? "bg-white scale-125" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

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
        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite logic
          }}
        >
          <FavouriteIcon size={18} />
        </button>

        {/* Video Icon Mockup (like Fiverr) */}
        <div className="absolute bottom-3 left-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white">
          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
        </div>

        {/* Pagination Dots Mockup */}
        <div className="absolute bottom-3 right-0 left-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-white' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 flex flex-col gap-2">

        {/* Gig Title / Name */}
        <h3 className="text-[15px] font-normal text-gray-900 line-clamp-2 leading-snug hover:underline">
          {product.name}
        </h3>

        {/* Seller Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar
                name={product.seller?.username || 'U'}
                size="xs"
                variant="light"
                className="ring-1 ring-gray-100"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
              {product.seller?.username || 'Seller'}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <StarIcon size={14} className="fill-gray-900 text-gray-900" />
          <span className="text-sm font-bold text-gray-900">5.0</span>
          <span className="text-sm text-gray-500">({product.vote_score || 0})</span>
        </div>

        {/* Price Section */}
        <div className="mt-auto pt-2 flex flex-col">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            From
          </div>
          <div className="text-lg font-bold text-gray-900">
            ₦{parseFloat(product.price || "0").toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePageClient({ initialProducts, categories, initialNext, initialPrev, initialCount }: { initialProducts: ProductType[] | null | undefined; categories: Category[] | null | undefined; initialNext?: string | null; initialPrev?: string | null; initialCount?: number; }) {
  const { data: session } = useSession();
  const { columns, toggleColumns } = useGrid();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    setSearch(searchParams.get('search') || "");
  }, [searchParams]);

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

  // Use products directly since backend handles filtering now
  const filteredProducts = products;

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

  // Handle search and category changes from URL
  useEffect(() => {
    const querySearch = searchParams.get('search') || "";
    const queryCategory = searchParams.get('category');
    
    const fetchFiltered = async () => {
      setIsInitialLoading(true);
      setPageError(null);
      try {
        const params: Record<string, string | number> = {};
        if (querySearch) params.search = querySearch;
        if (queryCategory) params.category = queryCategory;
        
        const response = await fetchProductsPage(undefined, params);
        setProducts(response.results);
        setNextPageUrl(response.next);
        setTotalCount(response.count);
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to fetch filtered products:", error);
        setPageError("Failed to load search results.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchFiltered();
  }, [searchParams]);

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
    <div className="min-h-screen bg-white font-sans">
      <Container as="main" className={`transition-all duration-300 ${isLoggedIn && !isVerified ? 'pt-[170px] md:pt-[125px]' : 'pt-[130px] md:pt-20'} pb-16`}>
        
        {/* Hero Section */}
        {(!searchParams.get('search') && !searchParams.get('category')) && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mb-20 mt-4 lg:mt-10">
            {/* Left: Text */}
            <div className="flex-1 space-y-6 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <h1 className="text-2xl sm:text-4xl lg:text-[px] font-semibold text-gray-900 leading-[1.1] tracking-tight">
                Discover the world's top <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008000] to-green-400">products</span> & services.
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Explore a marketplace of thousands of highly-rated vendors, premium digital services, and exclusive products.
              </p>
              {!isLoggedIn && (
                <div className="pt-4">
                  <Link href="/auth/signup" className="inline-block px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all hover:scale-105 shadow-xl hover:shadow-gray-900/20 text-lg">
                    Get started
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Carousel */}
            <div className="w-full sm:w-[450px] lg:w-[480px] shrink-0 aspect-square relative rounded-[32px] overflow-hidden shadow-2xl bg-gray-100 group">
              <HeroCarousel products={products.slice(0, 5)} />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="w-full mt-4 lg:mt-10">
          {pageError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {pageError}
            </div>
          )}

          {isInitialLoading ? (
            <div className={`grid gap-6 justify-items-center grid-cols-2 lg:grid-cols-4 w-full`}>
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
              <div className={`grid gap-6 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 w-full`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div ref={observerTarget} className="mt-8 w-full flex justify-center pb-8">
                {isFetchingPage && (
                  <div className={`grid gap-6 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 w-full`}>
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
      </Container>
    </div>
  );
}
