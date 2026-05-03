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
import { Container } from "@/components/layout/Container";
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

// Vendor card component with proper typing
interface VendorCardProps {
  vendor: any;
}

const VendorCard = ({ vendor }: VendorCardProps) => {
  const { columns } = useGrid();

  return (
    <Link
      href={`/vendors/${vendor.username}`}
      className="group relative w-full bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={vendor.banner_url || vendor.avatar_url || "/assets/images/bi.png"}
          alt={vendor.username}
          fill
          className={`transition-transform duration-500 group-hover:scale-105 ${vendor.banner_url
              ? "object-cover" // FULL banner
              : "object-contain p-6" // logo fallback
            }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/assets/images/bi.png";
          }}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 flex flex-col gap-2">
        {/* Vendor Title / Name */}
        <h3 className="text-[17px] truncate font-bold text-gray-900 line-clamp-2 leading-snug hover:underline uppercase">
          {vendor.username}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500 font-medium line-clamp-2">{vendor.bio}</span>
        </div>

        {/* Rating */}
        {/* <div className="flex items-center gap-1">
          <StarIcon size={14} className="fill-gray-900 text-gray-900" />
          <StarIcon size={14} className="fill-gray-900 text-gray-900" />
          <StarIcon size={14} className="fill-gray-900 text-gray-900" />
          <StarIcon size={14} className="fill-gray-900 text-gray-900" />
          <StarIcon size={14} className="fill-gray-900 text-gray-900" />
          <span className="text-sm text-gray-500 ml-1">(5.0)</span>
        </div> */}

        <div className="mt-auto pt-4">
          <div className="w-full text-center text-sm bg-[#f5f5f5] text-gray-900 py-2.5 rounded-xl group-hover:bg-[#006000] hover:text-white transition-colors font-bold hover:shadow-sm">
            Visit Store
          </div>
        </div>
      </div>
    </Link>
  );
};

interface VendorsPageProps {
  params: Promise<any>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Vendors({
  params,
  searchParams
}: VendorsPageProps) {
  // These initial values are not passed to Next.js pages but 
  // were present in the previous interface. We initialize them as constants.
  const initialProducts: ProductType[] | null | undefined = undefined;
  const categories: Category[] | null | undefined = undefined;
  const initialNext: string | null = null;
  const initialPrev: string | null = null;
  const initialCount: number = 0;

  const { data: session } = useSession();
  const user = session?.user;
  const isLoggedIn = !!session;
  const { columns, toggleColumns } = useGrid();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const normalizedCategories = Array.isArray(categories) ? categories : [];
  const normalizedInitialProducts = Array.isArray(initialProducts) ? initialProducts : [];

  const [products, setProducts] = useState<ProductType[]>(normalizedInitialProducts);
  const [categoriesState, setCategoriesState] = useState<Category[]>(normalizedCategories);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialNext ?? null);
  const [totalCount, setTotalCount] = useState<number>(initialCount ?? 0);

  const [isInitialLoading, setIsInitialLoading] = useState(normalizedInitialProducts.length === 0);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (normalizedInitialProducts.length > 0 || normalizedCategories.length > 0) {
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProductsPage(undefined, { page_size: 100 }),
          import("@/lib/categories").then(m => m.fetchCategories())
        ]);

        setProducts(productsData.results);
        setCategoriesState(categoriesData);
        setNextPageUrl(productsData.next);
        setTotalCount(productsData.count);
      } catch (error) {
        console.error("Failed to fetch initial vendors data:", error);
        setPageError("Failed to load vendors. Please refresh.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [normalizedInitialProducts.length, categories]);

  // Extract unique vendors from products
  const uniqueVendors = products.reduce((acc: any[], product) => {
    if (product.seller && !acc.find(v => v.id === product.seller.id)) {
      acc.push(product.seller);
    }
    return acc;
  }, []);

  const filteredVendors = uniqueVendors.filter((vendor) => {
    const lowerSearch = search.toLowerCase();
    return vendor.username?.toLowerCase().includes(lowerSearch);
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



  const isEmptyState = !isInitialLoading && uniqueVendors.length === 0;

  return (
    <div className={`w-full bg-white min-h-screen transition-all duration-300 ${session && !((session.user as any)?.is_verified ?? (session.user as any)?.email_verified ?? true) ? 'pt-[170px] md:pt-[125px]' : 'pt-[130px] md:pt-[90px]'}`}>
      <Container className="mt-2 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-5 ">Find the best vendors for your needs</h1>
        {/* Search Bar Container */}
        <div className="mx-auto ">
          <div className="flex items-center w-full max-w-2xl bg-white rounded-lg sm:rounded-xl p-1 shadow-2xl group-within:ring-4 group-within:ring-white/10 transition-all h-[52px] sm:h-[58px] overflow-hidden">
            <input
              type="text"
              placeholder="Search for any vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 text-zinc-800 placeholder:text-zinc-400 focus:outline-none font-medium bg-transparent text-[14px] sm:text-base h-full"
            />
            <div
              className="text-black px-5 h-full flex items-center justify-center shrink-0"
            >
              <Search02Icon size={20} />
            </div>
          </div>
        </div>

        <div className="w-full">
          {pageError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {pageError}
            </div>
          )}

          {isInitialLoading ? (
            <div className={`grid gap-6 justify-items-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full`}>
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
            <EmptyState message="No matching vendors found" />
          ) : (
            <>
              <div className={`grid gap-6 justify-items-center transition-all duration-300 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full`}>
                {filteredVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>

              <div ref={observerTarget} className="mt-8 w-full flex justify-center pb-8">
                {isFetchingPage && (
                  <div className={`grid gap-6 justify-items-center transition-all duration-300 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full`}>
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
