"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts, updateProduct } from "@/lib/products";
import { toast } from "react-hot-toast";
import {
    ArrowLeft02Icon,
    ImageAdd01Icon,
    PackageIcon,
    Dollar01Icon,
    File01Icon
} from "hugeicons-react";
import Link from "next/link";
import Image from "next/image";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        product_type: 'physical',
        image: null as File | null
    });

    useEffect(() => {
        const getProduct = async () => {
            try {
                const allProducts = await fetchProducts();
                const product = allProducts.find((p: any) => p.id === parseInt(id));
                if (product) {
                    setFormData({
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        product_type: product.product_type || 'physical',
                        image: null
                    });
                    setImagePreview(product.image_url);
                } else {
                    toast.error("Product not found");
                    router.push('/profile');
                }
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("Failed to load product details");
            } finally {
                setIsFetching(false);
            }
        };

        if (id) getProduct();
    }, [id, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!(session as any)?.access_token) {
            toast.error("You must be logged in");
            return;
        }

        setIsLoading(true);
        try {
            await updateProduct(parseInt(id), formData, (session as any).access_token);
            toast.success("Product updated successfully!");
            router.push('/profile');
            router.refresh();
        } catch (error: any) {
            console.error("Update error:", error);
            const msg = error.response?.data?.detail || "Failed to update product";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/profile"
                    className="flex items-center gap-2 text-zinc-500 hover:text-black mb-8 font-semibold transition-colors w-fit"
                >
                    <ArrowLeft02Icon size={20} />
                    Back to Profile
                </Link>

                <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-xl shadow-zinc-200/50">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-zinc-900 mb-2">Edit Product</h1>
                        <p className="text-zinc-500 font-medium">Update your listing details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload Area */}
                        <div>
                            <label className="block text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Product Image</label>
                            <label className="relative group cursor-pointer block rounded-[24px] overflow-hidden aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 hover:border-black transition-all">
                                {imagePreview ? (
                                    <>
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-[12px] font-bold text-sm flex items-center gap-2">
                                                <ImageAdd01Icon size={20} />
                                                Change Image
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 group-hover:text-black transition-colors">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-zinc-50">
                                            <ImageAdd01Icon size={32} />
                                        </div>
                                        <p className="font-bold">Click to upload photo</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Product Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                                        <PackageIcon size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Name of your item"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-black/5 focus:bg-white focus:border-black transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Product Type</label>
                                <select
                                    value={formData.product_type}
                                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                    className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-black/5 focus:bg-white focus:border-black transition-all font-bold text-sm appearance-none cursor-pointer"
                                >
                                    <option value="physical">Physical Product</option>
                                    <option value="service">Service / Freelance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Price (NGN)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                                        <Dollar01Icon size={20} />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-black/5 focus:bg-white focus:border-black transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Description</label>
                            <div className="relative">
                                <div className="absolute top-4 left-4 pointer-events-none text-zinc-400">
                                    <File01Icon size={20} />
                                </div>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Tell potential buyers about your item..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-[16px] focus:outline-none focus:ring-4 focus:ring-black/5 focus:bg-white focus:border-black transition-all font-medium text-sm resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white rounded-[18px] py-5 font-black text-lg hover:bg-zinc-800 transition-all hover:scale-[1.02] shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Update Listing</span>
                                    <PackageIcon size={24} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
