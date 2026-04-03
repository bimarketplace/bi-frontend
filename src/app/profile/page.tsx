"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { fetchProducts, deleteProduct, Product } from "@/lib/products";
import Link from "next/link";
import Image from "next/image";
import {
  PlusSignIcon,
  PencilEdit01Icon,
  Delete02Icon,
  UserIcon,
  PackageIcon,
  Alert01Icon,
  WhatsappIcon,
  Settings01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon
} from "hugeicons-react";
import { toast } from "react-hot-toast";
import { updateProfile, fetchUserProfile } from "@/lib/auth";
import { Avatar, CloseIcon } from "@/components/layout/Navbar";



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
      className="flex items-center gap-2 bg-[#008000] text-white px-8 py-3.5 rounded-[12px] font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02]"
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

  // Profile settings states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    whatsapp_number: '',
    bio: ''
  });

  useEffect(() => {
    const getMyData = async () => {
      if (!session?.access_token) return;
      try {
        const [allProducts, profile] = await Promise.all([
          fetchProducts(),
          fetchUserProfile((session as any).access_token)
        ]);

        // Filter products where seller matches logged in user
        const myProducts = allProducts.filter((p: any) =>
          p.seller?.username === (session.user as any).username ||
          p.seller?.username === session.user?.name
        );
        setProducts(myProducts);
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

    if (session) getMyData();
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
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-[10px] text-zinc-600 text-sm font-semibold hover:bg-zinc-50 transition-colors"
                >
                  <Settings01Icon size={18} />
                  Profile Settings
                </button>
              </div>
            </div>
            <Link
              href="/products/new"
              className="bg-[#008000] text-white px-8 py-4 rounded-[12px] font-bold hover:bg-zinc-800 transition-all hover:scale-[1.05] flex items-center gap-2 shadow-xl shadow-primary-900/10"
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
                    ₦{parseFloat(product.price).toLocaleString()}
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
    </div>
  );
}
