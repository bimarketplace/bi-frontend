"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FavouriteIcon, StarIcon, ThumbsUpIcon, ThumbsDownIcon, Message01Icon, Search02Icon, GridIcon, ArrowRight01Icon, ArrowLeft02Icon, ArrowRight02Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/layout/Navbar";
import { useGrid } from "@/context/GridContext";
import { Category } from "@/lib/categories";
import { fetchProductsPage, Product as ProductType } from "@/lib/products";
import { fetchStates, fetchLGAs, State, LGA } from "@/lib/locations";
import { fetchUserProfile } from "@/lib/auth";
import toast from "react-hot-toast";
import Tabs from '@/components/Tabs';
import ProductModal from "@/components/ProductModal";

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

// Product card component
interface ProductCardProps {
  product: ProductType;
  onSelect: (product: ProductType) => void;
}

const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  const { columns } = useGrid();

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative w-full bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
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
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2">
        <h3 className="text-[15px] font-normal text-gray-900 line-clamp-2 leading-snug hover:underline">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex flex-col">
          <div className="text-lg font-bold text-gray-900">
            ₦{parseFloat(product.price || "0").toLocaleString()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <Link 
              href={`/vendors/${product.seller?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-bold text-gray-900 truncate max-w-[120px] hover:underline hover:text-brand-green transition-colors"
            >
              {product.seller?.username || 'Seller'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Products({ 
  initialProducts, 
  categories, 
  initialNext, 
  initialPrev, 
  initialCount 
}: { 
  initialProducts: ProductType[] | null | undefined; 
  categories: Category[] | null | undefined; 
  initialNext?: string | null; 
  initialPrev?: string | null; 
  initialCount?: number; 
}) {
  const { data: session } = useSession();
  const { columns, toggleColumns } = useGrid();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [selectedLgaId, setSelectedLgaId] = useState<string>("");
  
  // Use unique names to avoid any potential shadowing issues
  const [locationStates, setLocationStates] = useState<State[]>([]);
  const [locationLgas, setLocationLgas] = useState<LGA[]>([]);
  
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const normalizedCategories = Array.isArray(categories) ? categories : [];
  const normalizedInitialProducts = Array.isArray(initialProducts) ? initialProducts : [];

  const [products, setProducts] = useState<ProductType[]>(normalizedInitialProducts);
  const [categoriesState, setCategoriesState] = useState<Category[]>(normalizedCategories);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialNext ?? null);
  const [totalCount, setTotalCount] = useState<number>(initialCount ?? 0);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(normalizedInitialProducts.length === 0 && (!categories || categories.length === 0));
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Pre-generate options for maximum stability
  const stateOptions = useMemo(() => {
    if (!Array.isArray(locationStates)) return [];
    return locationStates.map(s => (
      <option key={s.id} value={s.id}>{s.name}</option>
    ));
  }, [locationStates]);

  const lgaOptions = useMemo(() => {
    if (!Array.isArray(locationLgas)) return [];
    return locationLgas.map(l => (
      <option key={l.id} value={l.id}>{l.name}</option>
    ));
  }, [locationLgas]);

  // Load locations and user default location
  useEffect(() => {
    const initFilters = async () => {
      try {
        const statesData = await fetchStates();
        setLocationStates(Array.isArray(statesData) ? statesData : []);

        if (session?.access_token) {
          const profile = await fetchUserProfile((session as any).access_token);
          if (profile.state) {
            setSelectedStateId(profile.state.toString());
            const lgasData = await fetchLGAs(profile.state);
            setLocationLgas(Array.isArray(lgasData) ? lgasData : []);
            if (profile.lga) {
              setSelectedLgaId(profile.lga.toString());
            }
          }
        }
      } catch (error) {
        console.error("Init filters error:", error);
      } finally {
        setIsFirstLoad(false);
      }
    };
    initFilters();
  }, [session]);

  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedLgaId("");
    if (stateId) {
      try {
        const lgasData = await fetchLGAs(Number(stateId));
        setLocationLgas(Array.isArray(lgasData) ? lgasData : []);
      } catch (error) {
        console.error("Fetch LGAs error:", error);
        setLocationLgas([]);
      }
    } else {
      setLocationLgas([]);
    }
  };

  const refreshProducts = useCallback(async () => {
    if (isFirstLoad) return;
    
    setIsFetchingPage(true);
    try {
      const params: any = {};
      if (selectedCategoryId) params.category = selectedCategoryId;
      if (selectedStateId) params.seller__state = selectedStateId;
      if (selectedLgaId) params.seller__lga = selectedLgaId;
      
      const data = await fetchProductsPage(undefined, params);
      setProducts(data.results || []);
      setNextPageUrl(data.next);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error("Refresh products error:", error);
    } finally {
      setIsFetchingPage(false);
    }
  }, [selectedCategoryId, selectedStateId, selectedLgaId, isFirstLoad]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

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

        setProducts(productsData.results || []);
        setCategoriesState(categoriesData || []);
        setNextPageUrl(productsData.next);
        setTotalCount(productsData.count || 0);
      } catch (error) {
        console.error("Failed to fetch initial products:", error);
        setPageError("Failed to load products. Please refresh.");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [normalizedInitialProducts.length, categories]);

  const filteredProducts = products.filter((product) => {
    const lowerSearch = search.toLowerCase();
    const matchesSearch = product.name?.toLowerCase().includes(lowerSearch) ||
      product.description?.toLowerCase().includes(lowerSearch) ||
      product.seller?.username?.toLowerCase().includes(lowerSearch);

    const matchesCategory = selectedCategoryId === null || product.category?.id === selectedCategoryId;

    return matchesSearch && matchesCategory;
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!nextPageUrl || isFetchingPage) return;
    setIsFetchingPage(true);
    setPageError(null);

    try {
      const response = await fetchProductsPage(nextPageUrl);
      setProducts(prev => [...prev, ...(response.results || [])]);
      setNextPageUrl(response.next);
      setTotalCount(response.count || 0);
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
    <div className="w-full">
      <div className="pb-16 px-4 sm:px-8">
        <div className="max-w-6xl">
          {/* Search Bar Container */}
          <div className="flex items-center w-full max-w-2xl lg:mx-5 bg-white rounded-lg sm:rounded-xl p-1 shadow-2xl group-within:ring-4 group-within:ring-white/10 transition-all h-[52px] sm:h-[58px] overflow-hidden">
            <input
              type="text"
              placeholder="Search for any service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 text-zinc-800 placeholder:text-zinc-400 focus:outline-none font-medium bg-transparent text-[14px] sm:text-base h-full"
            />
            <div className="text-black px-5 h-full flex items-center justify-center shrink-0">
              <Search02Icon size={20} />
            </div>
          </div>

          {/* Location Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-4 lg:mx-5">
            <div className="relative">
              <select
                value={selectedStateId}
                onChange={(e) => handleStateChange(e.target.value)}
                className="appearance-none bg-zinc-50 border border-zinc-100 px-4 py-2 pr-10 rounded-full text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008000]/20 transition-all cursor-pointer hover:bg-zinc-100 shadow-sm"
              >
                <option value="">All States</option>
                {stateOptions}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedLgaId}
                onChange={(e) => setSelectedLgaId(e.target.value)}
                disabled={!selectedStateId}
                className="appearance-none bg-zinc-50 border border-zinc-100 px-4 py-2 pr-10 rounded-full text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008000]/20 transition-all cursor-pointer hover:bg-zinc-100 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All LGAs</option>
                {lgaOptions}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {(selectedStateId || selectedLgaId) && (
              <button 
                onClick={() => {
                  setSelectedStateId("");
                  setSelectedLgaId("");
                  setLocationLgas([]);
                }}
                className="text-[12px] font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="max-w-6xl mx-auto mb-5">
          <div className="flex justify-end items-end mb-6">
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
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`flex-none w-fit py-2 px-4 rounded-full border transition-all duration-300 flex items-center gap-3 text-left group
                ${selectedCategoryId === null
                  ? "text-white bg-[#008000] shadow-[0_4px_15px_rgba(0,128,0,0.1)]"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
            >
              <span className={`text-[12px] font-medium transition-colors ${selectedCategoryId === null ? "text-white" : "text-gray-700"}`}>
                All Products
              </span>
            </button>

            {categoriesState.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`flex-none w-fit py-2 px-4 rounded-full border transition-all duration-300 flex items-center gap-3 text-left group
                  ${selectedCategoryId === category.id
                    ? "text-white bg-[#008000] shadow-[0_4px_15_rgba(0,128,0,0.1)]"
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
                  <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
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
