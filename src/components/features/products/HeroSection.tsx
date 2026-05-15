import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GridIcon, Message01Icon, Search02Icon } from "hugeicons-react";
import { Avatar } from "@/components/layout/Navbar";
import { Product as ProductType } from "@/lib/products";
import HeroCarousel from "./HeroCarousel";

interface HeroSectionProps {
  search: string;
  setSearch: (val: string) => void;
  searchType: "products" | "services" | "vendors";
  setSearchType: (val: "products" | "services" | "vendors") => void;
  showSearchDropdown: boolean;
  setShowSearchDropdown: (val: boolean) => void;
  searchResults: ProductType[];
  isSearching: boolean;
  refreshProducts: () => void;
  setSelectedProduct: (val: ProductType) => void;
  products: ProductType[];
  session: any;
  selectedCategoryId: number | null;
  selectedStateId: string | null;
  searchDropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function HeroSection({
  search,
  setSearch,
  searchType,
  setSearchType,
  showSearchDropdown,
  setShowSearchDropdown,
  searchResults,
  isSearching,
  refreshProducts,
  setSelectedProduct,
  products,
  session,
  selectedCategoryId,
  selectedStateId,
  searchDropdownRef
}: HeroSectionProps) {
  if (search || selectedCategoryId || selectedStateId || products.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-8 mb-20 sm:mt-2 lg:mt-12">
      {/* Left: Text */}
      <div className="flex-1 text-center lg:text-left w-full max-w-[600px] mx-auto lg:mx-0">
        <h1 className="text-[36px] sm:text-[48px] lg:text-[56px] font-bold text-[#0D0C22] leading-[1.05] tracking-tight mb-6">
          Find the<br/>perfect products
        </h1>
        <p className="text-[18px] sm:text-[20px] text-[#0D0C22] font-medium leading-[32px] max-w-[480px] mx-auto lg:mx-0 mb-10">
          Explore a marketplace of thousands of highly-rated sellers ready to take on your next project.
        </p>
        
        <div className="w-full relative" ref={searchDropdownRef}>
          {/* 
          <div className="flex gap-2 mb-6 justify-center lg:justify-start">
            {["products", "services", "vendors"].map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type as any)}
                className={`px-5 py-3 rounded-full text-[15px] font-bold transition-all capitalize flex items-center gap-2 ${
                  searchType === type 
                    ? "bg-[#008000] text-white" 
                    : "bg-transparent text-[#0D0C22] hover:bg-gray-100"
                }`}
              >
                {type === "products" && <GridIcon size={18} />}
                {type === "services" && <Message01Icon size={18} />}
                {type === "vendors" && <Avatar name="V" size="xs" variant="primary" className="w-5 h-5" />}
                {type}
              </button>
            ))}
          </div>
          */}

          <div className="flex items-center w-full max-w-[420px] mx-auto lg:mx-0 bg-[#f3f3f4] hover:bg-white hover:ring-4 hover:ring-[#008000]/20 rounded-full p-1 transition-all h-[48px] relative z-10 border border-transparent hover:border-[#008000]/30">
            <input
              type="text"
              placeholder={`What type of ${searchType.slice(0, -1)} are you interested in?`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => {
                if (search.length > 0) setShowSearchDropdown(true);
              }}
              className="flex-1 px-4 text-[#0D0C22] placeholder:text-gray-500 focus:outline-none font-medium bg-transparent text-[14px] h-full"
            />
            <button 
              onClick={() => {
                setShowSearchDropdown(false);
                refreshProducts();
              }}
              className="h-[40px] w-[40px] bg-[#008000] text-white rounded-full hover:bg-green-700 transition-colors flex items-center justify-center shrink-0 shadow-sm"
            >
              <Search02Icon size={18} />
            </button>
          </div>

          {/* <div className="mt-6 flex justify-center lg:justify-start">
            <Link href="/sell" className="bg-[#008000] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-900/10 active:scale-95">
              Start Selling
            </Link>
          </div> */}

          {/* Dropdown Panel */}
          {showSearchDropdown && search.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-2">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500 font-medium">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSelectedProduct(result);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-gray-100">
                          <Image 
                            src={result.image_url || "/assets/images/placeholder.png"} 
                            alt={result.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-bold text-gray-900 truncate">{result.name}</div>
                          <div className="text-[12px] text-gray-500 font-medium truncate">
                            ₦{parseFloat(result.price || "0").toLocaleString()} • {result.seller?.username || 'Seller'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500 font-medium">No results found</div>
                )}
              </div>
            </div>
          )}
          

        </div>

        {!session && (
          <div className="pt-8">
            {/* Removed old get started button to match Dribbble */}
          </div>
        )}
      </div>

      {/* Right: Carousel */}
      <div className="w-full sm:w-[440px] lg:w-[600px] xl:w-[560px] shrink-0 aspect-[4/3] relative rounded-[32px] overflow-hidden shadow-2xl bg-[#0D0C22] group">
        <HeroCarousel products={products.slice(0, 5)} />
      </div>
    </div>
  );
}
