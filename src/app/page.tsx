"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThumbsUpIcon, ThumbsDownIcon, Message01Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/layout/Navbar";

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
interface Product {
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
}

// Product card component with proper typing
interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className="card w-[360px] rounded-[12px] bg-white p-[20px] border border-gray-200/40 cursor-pointer hover:scale-[1.02] transition-transform duration-200 flex flex-col h-full"
    >
      <div className="product-profile flex justify-between items-center">
        <div className="name-seller-price flex items-center">
          <Avatar name={product.seller?.username || 'Unknown'} />
          <div className="ml-3">
            <h2 className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</h2>
            <p className="text-xs text-gray-600 mt-1">{product.seller?.username || 'Unknown Seller'}</p>
          </div>
        </div>
        <div className="price">
          <p className="text-sm font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
        </div>
      </div>

      <div className="product-info my-4 h-[40px] overflow-hidden">
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
      </div>

      <div className="relative w-full aspect-[320/185]">
        <Image
          src={product.image_url || "/assets/images/sale-fast.png"}
          alt={product.name || "Product image"}
          fill
          className="rounded-[12px] object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/assets/images/placeholder.png";
          }}
        />
      </div>

      <div className="product-actions flex gap-6 mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-400">
          <ThumbsUpIcon size={18} />
          <span className="text-xs font-medium">{product.vote_score || 0}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <ThumbsDownIcon size={18} />
          <span className="text-xs font-medium">0</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Message01Icon size={18} />
          <span className="text-xs font-medium">{product.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

import { fetchProducts } from "@/lib/products";

export default function Home() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user;
  const isLoggedIn = !!session;
  const isVerified = (user as any)?.is_verified ?? (user as any)?.email_verified ?? true;

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Main Content with padding for fixed header */}
      <main className={`transition-all duration-300 ${isLoggedIn && !isVerified ? 'pt-[125px]' : 'pt-20'} pb-16 px-4 sm:px-8`}>
        <div className="max-w-6xl mx-auto mt-10">
          {loading ? (
            // Loading state
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length === 0 ? (
            // Empty state
            <EmptyState message="No products found" />
          ) : (
            // Products grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}