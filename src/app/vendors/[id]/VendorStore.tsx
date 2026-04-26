"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
    FavouriteIcon, 
    StarIcon, 
    ThumbsUpIcon, 
    ThumbsDownIcon, 
    Message01Icon, 
    Search02Icon, 
    GridIcon, 
    ArrowRight01Icon, 
    ArrowLeft02Icon, 
    ArrowRight02Icon, 
    Cancel01Icon, 
    Location01Icon 
} from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/layout/Navbar";
import { useGrid } from "@/context/GridContext";
import { Category } from "@/lib/categories";
import { fetchProductsPage, Product as ProductType } from "@/lib/products";
import toast from "react-hot-toast";
import ProductModal from "@/components/ProductModal";

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const EmptyState = ({ message = "No products available" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="bg-gray-100 rounded-full p-6 mb-4">
      <AlertIcon />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{message}</h3>
    <p className="text-sm text-gray-500">Check back later for new products</p>
  </div>
);

const ProductCard = ({ product, onSelect }: { product: ProductType, onSelect: (product: ProductType) => void }) => {
  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative w-full bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={product.image_url || "/assets/images/placeholder.png"}
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
            <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
              {product.seller?.username || 'Seller'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VendorStore({ id, initialProducts, categoriesData }: { id: string, initialProducts: ProductType[], categoriesData: Category[] }) {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const [products, setProducts] = useState<ProductType[]>(initialProducts);
  const [categoriesState] = useState<Category[]>(categoriesData);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(initialProducts.length);
  const [isFetchingPage, setIsFetchingPage] = useState(false);

  const filteredProducts = products.filter((product) => {
    const lowerSearch = search.toLowerCase();
    const matchesSearch = product.name?.toLowerCase().includes(lowerSearch) ||
      product.description?.toLowerCase().includes(lowerSearch);
    const matchesCategory = selectedCategoryId === null || product.category?.id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const storeName = products.length > 0 ? products[0].seller.username : id;
  const firstName = products.length > 0 ? products[0].seller.first_name : "";
  const lastName = products.length > 0 ? products[0].seller.last_name : "";
  const fullName = firstName || lastName ? `${firstName || ""} ${lastName || ""}`.trim() : "";

  const isEmptyState = products.length === 0 || filteredProducts.length === 0;

  return (
    <div className="w-full pt-25 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="px-4 sm:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar 
                name={storeName.charAt(0).toUpperCase()} 
                size="lg"
                variant="light"
                className="ring-1 ring-gray-100 rounded-xxl"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 uppercase">
                {storeName}
              </span>
              {fullName && (
                <span className="text-sm font-medium text-gray-500">
                  {fullName}
                </span>
              )}
              {products.length > 0 && products[0].seller.state_details && (
                <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
                  <Location01Icon size={14} />
                  <span className="text-xs font-medium">
                    {products[0].seller.lga_details?.name ? `${products[0].seller.lga_details.name}, ` : ''}
                    {products[0].seller.state_details.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              const url = `${window.location.origin}/vendors/${id}`;
              const message = `🛍️ I'm now officially listed on BI Marketplace! Browse my store here: ${url}`;
              navigator.clipboard.writeText(message);
              toast.success("Store link copied!");
            }}
            className="px-5 py-2.5 cursor-pointer my-4 bg-[#f5f5f5] text-gray-900 text-[14px] font-bold rounded-[10px] hove:bg-[#fcfcfc] transition-all"
          >
            Copy Profile Link
          </button>
          <p className="text-sm font-medium text-gray-900 mb-4 whitespace-pre-wrap">
            {products.length > 0 && products[0].seller.bio 
              ? products[0].seller.bio 
              : `Welcome to ${storeName}'s store. We provide the best products at competitive prices.`}
          </p>

          <div className="flex items-center w-full max-w-2xl bg-white rounded-lg sm:rounded-xl p-1 shadow-2xl group-within:ring-4 group-within:ring-white/10 transition-all h-[52px] sm:h-[58px] overflow-hidden">
            <input
              type="text"
              placeholder="Search in this store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 text-zinc-800 placeholder:text-zinc-400 focus:outline-none font-medium bg-transparent text-[14px] sm:text-base h-full"
            />
            <div className="text-black px-5 h-full flex items-center justify-center shrink-0">
              <Search02Icon size={20} />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 mb-5 px-4 sm:px-8">
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`flex-none w-fit py-2 px-4 rounded-full border transition-all duration-300 ${selectedCategoryId === null ? "text-white bg-[#008000]" : "bg-white border-gray-200"}`}
            >
              All Products
            </button>
            {categoriesState.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`flex-none w-fit py-2 px-4 rounded-full border transition-all duration-300 ${selectedCategoryId === category.id ? "text-white bg-[#008000]" : "bg-white border-gray-200"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-5 px-4 sm:px-8">
          {isEmptyState ? (
            <EmptyState message="No matching products found" />
          ) : (
            <div className="grid gap-6 justify-items-center grid-cols-2 lg:grid-cols-4 w-full">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
