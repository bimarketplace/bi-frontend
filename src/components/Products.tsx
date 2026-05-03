"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FavouriteIcon, StarIcon, ThumbsUpIcon, ThumbsDownIcon, Message01Icon, Search02Icon, GridIcon, ArrowRight01Icon, Location01Icon, ArrowDown01Icon } from "hugeicons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/layout/Navbar";
import { useGrid } from "@/context/GridContext";
import { Category } from "@/lib/categories";
import { fetchProductsPage, Product as ProductType } from "@/lib/products";
import { fetchStates, fetchLGAs, State, LGA } from "@/lib/locations";
import { fetchUserProfile } from "@/lib/auth";
import toast from "react-hot-toast";
import ProductModal from "./ProductModal";
import { Container } from './layout/Container';

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

// Custom Dropdown Component
const CustomDropdown = ({ 
  value, 
  options, 
  onSelect, 
  isOpen, 
  setIsOpen, 
  placeholder = "Select option",
  disabled = false 
}: { 
  value: string; 
  options: { id: string | number; name: string }[]; 
  onSelect: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const selectedOption = options.find(opt => opt.id.toString() === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full sm:w-[180px] px-4 py-2.5 bg-white border rounded-full transition-all duration-200 text-left
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-[#008000] hover:shadow-sm cursor-pointer'}
          ${isOpen ? 'border-[#008000] ring-4 ring-[#008000]/5' : 'border-gray-200'}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Location01Icon size={16} className={value ? "text-[#008000]" : "text-gray-400"} />
          <span className={`text-[13px] font-semibold truncate ${value ? "text-gray-900" : "text-gray-500"}`}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <ArrowDown01Icon size={16} className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-[#008000]" : "text-gray-400"}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-[240px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[280px] overflow-y-auto no-scrollbar">
            <button
              onClick={() => { onSelect(""); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-[#008000] transition-colors"
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { onSelect(opt.id.toString()); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold transition-colors
                  ${value === opt.id.toString() 
                    ? "bg-[#008000]/5 text-[#008000]" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#008000]"}
                `}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}
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
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    searchParams.get('category') ? Number(searchParams.get('category')) : null
  );
  const [selectedStateId, setSelectedStateId] = useState<string>(searchParams.get('state') || "");
  const [selectedLgaId, setSelectedLgaId] = useState<string>(searchParams.get('lga') || "");

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isLgaOpen, setIsLgaOpen] = useState(false);

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

  // Load locations and user default location
  useEffect(() => {
    console.log("[Filters] Initializing filters. Session status:", !!session);
    const initFilters = async () => {
      try {
        const statesData = await fetchStates();
        console.log("[Filters] States loaded:", statesData?.length);
        setLocationStates(Array.isArray(statesData) ? statesData : []);

        try {
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
        } catch (profileError) {
          console.error("Failed to load user profile for filters:", profileError);
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

  // Handle URL changes
  useEffect(() => {
    const querySearch = searchParams.get('search') || "";
    const queryCategory = searchParams.get('category');
    const queryState = searchParams.get('state');
    const queryLga = searchParams.get('lga');

    setSearch(querySearch);
    if (queryCategory) setSelectedCategoryId(Number(queryCategory));
    if (queryState) setSelectedStateId(queryState);
    if (queryLga) setSelectedLgaId(queryLga);
  }, [searchParams]);

  const refreshProducts = useCallback(async () => {
    if (isFirstLoad) return;

    setIsFetchingPage(true);
    try {
      const params: any = {};
      if (search) params.search = search;
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
  }, [search, selectedCategoryId, selectedStateId, selectedLgaId, isFirstLoad]);

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

  // Products are filtered on the backend
  const filteredProducts = products;

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
      <Container className="pb-16">
        {/* Hero Section */}
        {(!search && !selectedCategoryId && !selectedStateId && products.length > 0) && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mb-20 mt-4 lg:mt-10">
            {/* Left: Text */}
            <div className="flex-1 space-y-6 text-center lg:text-left max-w-2xl mx-auto lg:mx-0 w-full">
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black text-gray-900 leading-[1.1] tracking-tight">
                Discover the world's top <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008000] to-green-400">products</span> & services.
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Explore a marketplace of thousands of highly-rated vendors, premium digital services, and exclusive products.
              </p>
              
              <div className="pt-2 w-full max-w-md mx-auto lg:mx-0">
                <div className="flex items-center w-full bg-white rounded-full p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-within:ring-4 group-within:ring-[#008000]/10 transition-all h-[60px] border border-gray-100 relative z-10">
                  <input
                    type="text"
                    placeholder="Search for any product or service..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-5 text-zinc-800 placeholder:text-zinc-400 focus:outline-none font-medium bg-transparent text-[15px] h-full"
                  />
                  <button 
                    onClick={() => refreshProducts()}
                    className="h-[48px] w-[48px] bg-[#008000] text-white rounded-full hover:bg-green-700 transition-colors flex items-center justify-center shrink-0 shadow-md"
                  >
                    <Search02Icon size={22} />
                  </button>
                </div>
              </div>

              {!session && (
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

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-4 pt-1 px-1 mt-4 no-scrollbar scroll-smooth snap-x">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`flex-none py-2 px-4 rounded-full border transition-all duration-300 snap-start
              ${selectedCategoryId === null
                ? "bg-[#008000] text-white shadow-[0_4px_15px_rgba(0,128,0,0.1)]"
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

        {/* Location Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <CustomDropdown 
            placeholder="All States"
            value={selectedStateId}
            options={locationStates}
            onSelect={handleStateChange}
            isOpen={isStateOpen}
            setIsOpen={setIsStateOpen}
          />

          <CustomDropdown 
            placeholder="All LGAs"
            value={selectedLgaId}
            options={locationLgas}
            onSelect={setSelectedLgaId}
            isOpen={isLgaOpen}
            setIsOpen={setIsLgaOpen}
            disabled={!selectedStateId}
          />

          {(selectedStateId || selectedLgaId) && (
            <button
              onClick={() => {
                setSelectedStateId("");
                setSelectedLgaId("");
                setLocationLgas([]);
              }}
              className="px-4 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1"
            >
              <span>✕</span> Clear Filters
            </button>
          )}
        </div>

        <div className="w-full mt-5">
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
