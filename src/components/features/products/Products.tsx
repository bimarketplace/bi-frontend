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
// import { Container } from '@/components/layout/Container';

// Extracted Components
import EmptyState from "@/components/common/EmptyState";
import CustomDropdown from "@/components/common/CustomDropdown";
import HeroCarousel from "./HeroCarousel";
import ProductCard from "./ProductCard";
import HeroSection from "./HeroSection";
import CategoryFilters from "./CategoryFilters";
import LocationFilters from "./LocationFilters";


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

  const [searchType, setSearchType] = useState<"products" | "services" | "vendors">("products");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [searchResults, setSearchResults] = useState<ProductType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

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

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch dropdown results
  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const fetchDropdownResults = async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const data = await fetchProductsPage(undefined, { search: debouncedSearch });
        setSearchResults(data.results ? data.results.slice(0, 5) : []);
      } catch (error) {
        console.error("Dropdown search error:", error);
      } finally {
        setIsSearching(false);
      }
    };
    fetchDropdownResults();
  }, [debouncedSearch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      {/* <Container className="pb-16"> */}
        {/* Hero Section */}
        <HeroSection
          search={search}
          setSearch={setSearch}
          searchType={searchType}
          setSearchType={setSearchType}
          showSearchDropdown={showSearchDropdown}
          setShowSearchDropdown={setShowSearchDropdown}
          searchResults={searchResults}
          isSearching={isSearching}
          refreshProducts={refreshProducts}
          setSelectedProduct={setSelectedProduct}
          products={products}
          session={session}
          selectedCategoryId={selectedCategoryId}
          selectedStateId={selectedStateId}
          searchDropdownRef={searchDropdownRef}
        />

        {/* Categories Horizontal Scroll */}
        <CategoryFilters
          categoriesState={categoriesState}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />

        {/* Location Filters */}
        <LocationFilters
          locationStates={locationStates}
          locationLgas={locationLgas}
          selectedStateId={selectedStateId}
          selectedLgaId={selectedLgaId}
          handleStateChange={handleStateChange}
          setSelectedLgaId={setSelectedLgaId}
          isStateOpen={isStateOpen}
          setIsStateOpen={setIsStateOpen}
          isLgaOpen={isLgaOpen}
          setIsLgaOpen={setIsLgaOpen}
          setLocationLgas={setLocationLgas}
          setSelectedStateId={setSelectedStateId}
        />

        <div className="w-full mt-5">
          {pageError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {pageError}
            </div>
          )}

          {isInitialLoading ? (
            <div className={`grid gap-8 justify-items-center grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 w-full`}>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="w-full flex flex-col animate-pulse">
                  <div className="aspect-square w-full bg-gray-100 rounded-[24px] mb-3" />
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                  <div className="h-3 bg-gray-50 rounded-full w-1/2" />
                </div>
              ))}
            </div>
          ) : isEmptyState ? (
            <EmptyState message="No matching products found" />
          ) : !selectedCategoryId && !search && !selectedStateId ? (
            /* Sectioned View by Category */
            <div className="space-y-16 w-full">
              {categoriesState.map((category) => {
                const categoryProducts = products.filter(p => p.category?.id === category.id);
                if (categoryProducts.length === 0) return null;

                return (
                  <section key={category.id} className="w-full">
                    <div className="flex justify-between items-center mb-6 px-1">
                      <h2 className="text-[22px] sm:text-[26px] font-bold text-[#0D0C22] tracking-tight">
                        {category.name}
                      </h2>
                      <button 
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-[14px] font-bold text-[#008000] hover:text-green-700 transition-colors flex items-center gap-1 group"
                      >
                        See All <ArrowRight01Icon size={16} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                    
                    <div className={`grid gap-x-6 gap-y-10 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 w-full`}>
                      {categoryProducts.slice(0, 5).map((product) => (
                        <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                      ))}
                    </div>
                  </section>
                );
              })}
              
              {/* Discover More Section for uncategorized products */}
              {(() => {
                const uncategorizedProducts = products.filter(p => !p.category || !categoriesState.some(c => c.id === p.category?.id));
                if (uncategorizedProducts.length === 0) return null;

                return (
                  <section key="uncategorized" className="w-full">
                    <div className="flex justify-between items-center mb-6 px-1">
                      <h2 className="text-[22px] sm:text-[26px] font-bold text-[#0D0C22] tracking-tight">
                        Discover More
                      </h2>
                    </div>
                    
                    <div className={`grid gap-x-6 gap-y-10 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 w-full`}>
                      {uncategorizedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                      ))}
                    </div>
                  </section>
                );
              })()}
              
              <div ref={observerTarget} className="mt-8 w-full flex justify-center pb-8">
                {isFetchingPage && (
                  <div className={`grid gap-x-6 gap-y-10 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 w-full`}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="w-full flex flex-col animate-pulse">
                        <div className="aspect-square w-full bg-gray-100 rounded-[24px] mb-3" />
                        <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                        <div className="h-3 bg-gray-50 rounded-full w-1/2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Standard Grid View */
            <>
              <div className={`grid gap-x-6 gap-y-10 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 w-full`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                ))}
              </div>

              <div ref={observerTarget} className="mt-8 w-full flex justify-center pb-8">
                {isFetchingPage && (
                  <div className={`grid gap-x-6 gap-y-10 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 w-full`}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="w-full flex flex-col animate-pulse">
                        <div className="aspect-square w-full bg-gray-100 rounded-[24px] mb-3" />
                        <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                        <div className="h-3 bg-gray-50 rounded-full w-1/2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      {/* </Container> */}
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
