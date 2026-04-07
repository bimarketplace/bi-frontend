"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { fetchProductsPage, deleteProduct, Product } from "@/lib/products";
import Link from "next/link";
import Image from "next/image";
import {
  PlusSignIcon,
  PencilEdit01Icon,
  Delete02Icon,
  PackageIcon,
  WhatsappIcon,
  Settings01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Search02Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon
} from "hugeicons-react";
import { toast } from "react-hot-toast";
import { updateProfile, fetchUserProfile } from "@/lib/auth";
import { Avatar, CloseIcon } from "@/components/layout/Navbar";
import CreateProductModal from "@/components/CreateProductModal";

// Simple Alert icon component
const AlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <AlertIcon />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No products yet</h3>
      <p className="text-sm text-gray-500 mb-8">Start your marketplace journey by creating your first product.</p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-[#008000] text-white px-8 py-3.5 rounded-[12px] font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02]"
      >
        <PlusSignIcon size={20} />
        Add First Product
      </button>
    </div>
  );

export default function ProfilePage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile settings states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    whatsapp_number: '',
    bio: ''
  });

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoriesState, setCategoriesState] = useState<any[]>([]);

  const refreshData = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const username = (session.user as any).username || session.user?.name;
      const fetchCategories = await import("@/lib/categories").then(m => m.fetchCategories);
      
      const [productsData, profile, categoriesData] = await Promise.all([
        fetchProductsPage(undefined, { seller__username: username }),
        fetchUserProfile((session as any).access_token),
        fetchCategories()
      ]);
      
      const allProducts = productsData.results;

      const myProducts = allProducts.filter((p: any) =>
        p.seller?.username === (session.user as any).username ||
        p.seller?.username === session.user?.name
      );
      setProducts(myProducts);
      setCategoriesState(categoriesData);
      setProfileData({
        whatsapp_number: profile.whatsapp_number || '',
        bio: profile.bio || ''
      });
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) refreshData();
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    setIsUpdating(true);
    try {
      await updateProfile(profileData, (session as any).access_token);
      toast.success("Profile updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

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

  const filteredProducts = products.filter((product) => {
    const lowerSearch = search.toLowerCase();
    const matchesSearch = product.name?.toLowerCase().includes(lowerSearch) ||
      product.description?.toLowerCase().includes(lowerSearch);
    const matchesCategory = selectedCategoryId === null || product.category?.id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-4 italic">BIMARKETPLACE</h1>
          <p className="text-zinc-500 mb-8">Please sign in to view your profile</p>
          <Link href="/auth/login" className="bg-[#008000] text-white px-8 py-3 rounded-[12px] font-bold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const storeName = (session.user as any).username || session.user?.name || "User Profile";

  return (
    <div className="w-full pt-25 pb-20 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="px-4 sm:px-8">
          {/* Seller profile (Matching Vendor Page Style) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar 
                  name={storeName.charAt(0).toUpperCase()} 
                  size="lg"
                  variant="light"
                  className="ring-1 ring-gray-100 rounded-xxl"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 uppercase">
                  {storeName}
                </span>
                <p className="text-sm font-medium text-gray-500">
                    {products.length} Products listed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-700 text-[14px] font-bold hover:bg-gray-50 transition-all"
                >
                    <Settings01Icon size={18} />
                    Settings
                </button>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#008000] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-primary-700 transition-all shadow-sm"
                >
                    <PlusSignIcon size={18} />
                    Add Product
                </button>
            </div>
          </div>

          <p className="text-sm font-medium text-gray-900 mb-8 max-w-3xl leading-relaxed">
            {profileData.bio || `Welcome to ${storeName}'s store. Manage your listings and profile settings below.`}
          </p>

          {/* Search Bar Container (Matching Vendor Page Style) */}
          <div className="flex items-center w-full max-w-2xl bg-white rounded-lg sm:rounded-xl p-1 shadow-2xl group-within:ring-4 group-within:ring-white/10 transition-all h-[52px] sm:h-[58px] overflow-hidden border border-gray-100">
            <input
              type="text"
              placeholder="Search in your store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 text-zinc-800 placeholder:text-zinc-400 focus:outline-none font-medium bg-transparent text-[14px] sm:text-base h-full"
            />
            <div className="text-black px-5 h-full flex items-center justify-center shrink-0">
              <Search02Icon size={20} />
            </div>
          </div>
        </div>

        {/* Categories Bar (Matching Vendor Page Style) */}
        <div className="max-w-6xl mx-auto mt-8 mb-5 px-4 sm:px-8">
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
                    ? "text-white bg-[#008000] shadow-[0_4px_15px_rgba(0,128,0,0.1)]"
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

        <div className="max-w-6xl mx-auto mt-5 px-4 sm:px-8">
          {loading ? (
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
          ) : filteredProducts.length === 0 ? (
            <EmptyState onAdd={() => setIsCreateModalOpen(true)} />
          ) : (
            <div className={`grid gap-4 justify-items-center transition-all duration-300 grid-cols-2 lg:grid-cols-4 w-full`}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative w-full bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        <Image
                            src={product.image_url || "/assets/images/placeholder.png"}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                        />
                         <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg font-bold text-[12px] shadow-sm border border-gray-100">
                            ₦{parseFloat(product.price).toLocaleString()}
                        </div>
                    </div>

                    <div className="flex-1 p-3 flex flex-col gap-2">
                        <h3 className="text-[14px] font-medium text-gray-900 line-clamp-2 leading-snug">
                            {product.name}
                        </h3>
                        
                        <div className="mt-auto pt-2 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                                        {storeName}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/products/edit/${product.id}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-900 rounded-lg text-[12px] font-bold hover:bg-gray-100 transition-colors border border-gray-100"
                                >
                                    <PencilEdit01Icon size={14} />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                                >
                                    <Delete02Icon size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#008000]/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                <Settings01Icon size={28} />
                Profile Settings
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-zinc-100">
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider">WhatsApp Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <WhatsappIcon size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="+234..."
                    value={profileData.whatsapp_number}
                    onChange={(e) => setProfileData({ ...profileData, whatsapp_number: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:bg-white focus:border-primary-600 transition-all font-medium"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-400 font-medium">Include country code for the direct WhatsApp link to work.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider">Public Bio</label>
                <textarea
                  rows={4}
                  placeholder="Tell the community about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:bg-white focus:border-primary-600 transition-all font-medium resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-zinc-50 text-zinc-600 rounded-[18px] font-bold hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                >
                  <Cancel01Icon size={20} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-[2] py-4 bg-[#008000] text-white rounded-[18px] font-black text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-primary-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckmarkCircle01Icon size={22} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <CreateProductModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onSuccess={refreshData}
        />
      )}
    </div>
  );
}
