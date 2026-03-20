"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThumbsUpIcon, ThumbsDownIcon, Message01Icon, Search01Icon, GridIcon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/layout/Navbar";
import { useGrid } from "@/context/GridContext";
import { Category } from "@/lib/categories";

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

// Product type definition matching backend schema
export interface Product {
  id: number;
  name: string;
  seller: {
    username: string;
    avatar_url?: string;
  };
  price: string;
  description: string;
  image_url: string;
  vote_score: number;
  share_count: number;
  comments: any[];
  whatsapp_link?: string;
  category?: {
    id: number;
    name: string;
  };
}

// Product card component with proper typing
interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { columns } = useGrid();

  // Define responsive styles based on grid columns
  const isCompact = columns >= 2;
  const isMini = columns === 3;

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className={`card w-full rounded-[12px] bg-white border border-gray-200/40 cursor-pointer hover:scale-[1.02] transition-all duration-200 flex flex-col h-full shadow-sm overflow-hidden ${
        isMini ? 'p-2' : isCompact ? 'p-3' : 'p-[20px]'
      }`}
    >
      <div className={`product-profile flex justify-between items-start ${isMini ? 'flex-col' : 'items-center'}`}>
        <div className="name-seller-price flex items-center min-w-0 flex-1">
          {!isMini && <Avatar name={product.seller?.username || 'Unknown'} size={isCompact ? 'sm' : 'md'} />}
          <div className={!isMini ? 'ml-3 min-w-0' : 'min-w-0'}>
            <h2 className={`font-semibold text-gray-800 truncate ${isMini ? 'text-[10px]' : isCompact ? 'text-xs' : 'text-sm'}`}>
              {product.name}
            </h2>
            {!isMini && (
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{product.seller?.username || 'Unknown Seller'}</p>
            )}
          </div>
        </div>
        <div className={`price shrink-0 ${isMini ? 'mt-1' : 'ml-2'}`}>
          <p className={`font-bold text-gray-900 ${isMini ? 'text-[11px]' : isCompact ? 'text-xs' : 'text-sm'}`}>
            ₦{parseFloat(product.price || "0").toLocaleString()}
          </p>
        </div>
      </div>

      {!isMini && (
        <div className={`product-info overflow-hidden ${isCompact ? 'my-2 h-[32px]' : 'my-4 h-[40px]'}`}>
          <p className={`text-gray-600 line-clamp-2 ${isCompact ? 'text-[10px]' : 'text-sm'}`}>
            {product.description}
          </p>
        </div>
      )}

      <div className={`relative w-full aspect-[320/185] ${isMini ? 'mt-2' : 'mt-0'}`}>
        <Image
          src={product.image_url || "/assets/images/sale-fast.png"}
          alt={product.name || "Product image"}
          fill
          className="rounded-[8px] object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/assets/images/placeholder.png";
          }}
        />
      </div>

      <div className={`product-actions flex items-center border-t border-gray-100 ${
        isMini ? 'gap-2 mt-2 pt-2 justify-between' : isCompact ? 'gap-3 mt-3 pt-3' : 'gap-6 mt-auto pt-4'
      }`}>
        <div className="flex items-center gap-1 text-gray-400">
          <ThumbsUpIcon size={isMini ? 12 : 16} />
          <span className={`${isMini ? 'text-[9px]' : 'text-xs'} font-medium`}>{product.vote_score || 0}</span>
        </div>
        {!isMini && (
          <div className="flex items-center gap-1 text-gray-400">
            <ThumbsDownIcon size={16} />
            <span className="text-xs font-medium">0</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-gray-400">
          <Message01Icon size={isMini ? 12 : 16} />
          <span className={`${isMini ? 'text-[9px]' : 'text-xs'} font-medium`}>{product.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default function HomePageClient({ initialProducts, categories }: { initialProducts: Product[], categories: Category[] }) {
  const { data: session } = useSession();
  const { columns, toggleColumns } = useGrid();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const user = session?.user;
  const isLoggedIn = !!session;
  const isVerified = (user as any)?.is_verified ?? (user as any)?.email_verified ?? true;

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase()) ||
      product.seller?.username?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategoryId === null || product.category?.id === selectedCategoryId;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <main className={`transition-all duration-300 ${isLoggedIn && !isVerified ? 'pt-[125px]' : 'pt-20'} pb-16 px-4 sm:px-8`}>
        <div className="my-8 flex justify-center items-center gap-3 w-full max-w-lg mx-auto">
          <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-all duration-300">
              <Search01Icon size={20} />
            </div>
            <input
              type="text"
              placeholder="Search products, sellers or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200/60 focus:outline-none focus:ring-[6px] focus:ring-black/5 focus:border-black/30 transition-all duration-500 placeholder:text-gray-400 font-medium shadow-sm hover:shadow-md"
            />
          </div>
          
          <button 
            onClick={toggleColumns}
            className="sm:hidden p-3.5 bg-white rounded-2xl border border-gray-200/60 text-gray-500 hover:text-black hover:border-black/30 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            title="Toggle layout"
          >
            <GridIcon size={20} />
            <span className="text-[11px] font-extrabold">{columns}</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all duration-300 border ${
                selectedCategoryId === null
                  ? "bg-black text-white border-black shadow-md"
                  : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
              }`}
            >
              All Products
            </button>
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all duration-300 border ${
                  selectedCategoryId === category.id
                    ? "bg-black text-white border-black shadow-md"
                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                }`}
              >
                {category.image_url && (
                  <div className="relative w-4 h-4 rounded-full overflow-hidden">
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {category.name}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10">
          {initialProducts.length === 0 ? (
            <EmptyState message="No products found" />
          ) : filteredProducts.length === 0 ? (
             <EmptyState message="No matching products found" />
          ) : (
            <div className={`grid gap-5 justify-items-center transition-all duration-300 ${
              columns === 1 ? 'grid-cols-1' : 
              columns === 2 ? 'grid-cols-2' : 
              'grid-cols-3'
            } md:grid-cols-2 lg:grid-cols-3 w-full`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
