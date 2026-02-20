"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { fetchProducts, deleteProduct } from "@/lib/products";
import Link from "next/link";
import Image from "next/image";
import {
  PlusSignIcon,
  PencilEdit01Icon,
  Delete02Icon,
  UserIcon,
  PackageIcon,
  Alert01Icon
} from "hugeicons-react";
import { toast } from "react-hot-toast";

import { Avatar } from "@/components/layout/Navbar";

interface Product {
  id: number;
  name: string;
  seller: {
    username: string;
  };
  price: string;
  description: string;
  image_url: string;
  vote_score: number;
  comments: any[];
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm px-6">
    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
      <PackageIcon size={40} className="text-zinc-400" />
    </div>
    <h3 className="text-xl font-bold text-zinc-900 mb-2">No products yet</h3>
    <p className="text-zinc-500 text-center max-w-sm mb-8">
      You haven't listed any items for sale yet. Start your marketplace journey by creating your first product.
    </p>
    <Link
      href="/products/new"
      className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-[12px] font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02]"
    >
      <PlusSignIcon size={20} />
      Add First Product
    </Link>
  </div>
);

export default function ProfilePage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMyProducts = async () => {
      if (!session?.user) return;
      try {
        const allProducts = await fetchProducts();
        // Filter products where seller matches logged in user
        // Assuming username is the unique identifier available in both
        const myProducts = allProducts.filter((p: any) =>
          p.seller?.username === (session.user as any).username ||
          p.seller?.username === session.user?.name
        );
        setProducts(myProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load your products");
      } finally {
        setLoading(false);
      }
    };

    if (session) getMyProducts();
  }, [session]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id, (session as any).access_token);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic">BIMARKETPLACE</h1>
          <p className="text-zinc-500 mb-8">Please sign in to view your profile</p>
          <Link href="/auth/login" className="bg-black text-white px-8 py-3 rounded-[12px] font-bold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-[24px] p-8 md:p-12 mb-12 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar name={session.user?.name || (session.user as any).username || session.user?.email || "U"} size="xl" />
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black text-zinc-900 mb-2">
                {session.user?.name || (session.user as any).username || 'User Profile'}
              </h1>
              <p className="text-zinc-500 font-medium mb-4">{session.user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-[10px] text-zinc-600 text-sm font-semibold">
                  <PackageIcon size={18} />
                  {products.length} Products Listed
                </span>
              </div>
            </div>
            <Link
              href="/products/new"
              className="bg-black text-white px-8 py-4 rounded-[12px] font-bold hover:bg-zinc-800 transition-all hover:scale-[1.05] flex items-center gap-2 shadow-xl shadow-black/10"
            >
              <PlusSignIcon size={20} />
              Create Product
            </Link>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Your Products</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[24px] h-[400px] animate-pulse border border-zinc-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-[24px] border border-gray-100 p-5 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-300">
                <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden mb-5">
                  <Image
                    src={product.image_url || "/assets/images/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-[10px] font-bold text-sm shadow-sm">
                    ${parseFloat(product.price).toFixed(2)}
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="font-bold text-lg text-zinc-900 mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-zinc-500 text-sm line-clamp-2 mb-6 h-10">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-50">
                    <Link
                      href={`/products/edit/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-50 text-zinc-900 rounded-[12px] text-sm font-bold hover:bg-zinc-100 transition-colors"
                    >
                      <PencilEdit01Icon size={18} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-12 h-12 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-[12px] hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Delete02Icon size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
