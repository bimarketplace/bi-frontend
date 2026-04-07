"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    ImageAdd01Icon,
    PackageIcon,
    Dollar01Icon,
    File01Icon
} from "hugeicons-react";
import { Category, fetchCategories } from "@/lib/categories";

interface ProductFormProps {
    initialData?: {
        name: string;
        price: string;
        description: string;
        product_type: string;
        category: string | number;
        image_url?: string;
    };
    onSubmit: (formData: any) => Promise<void>;
    isLoading: boolean;
    submitText: string;
}

export default function ProductForm({ initialData, onSubmit, isLoading, submitText }: ProductFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        price: initialData?.price || '',
        description: initialData?.description || '',
        product_type: initialData?.product_type || 'physical',
        image: null as File | null,
        category: initialData?.category || ''
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        };
        loadCategories();
    }, []);

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
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Image Upload Area */}
            <div>
                <label className="block text-xs font-bold text-zinc-900 mb-3 uppercase tracking-wider">Product Image</label>
                <label className="relative group cursor-pointer block rounded-2xl overflow-hidden aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 hover:border-[#008000] transition-all">
                    {imagePreview ? (
                        <>
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-[#008000]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2">
                                    <ImageAdd01Icon size={16} />
                                    Change Image
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm border border-zinc-50 font-black">
                                <ImageAdd01Icon size={24} />
                            </div>
                            <p className="text-xs font-bold">Upload photo</p>
                        </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">Product Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                            <PackageIcon size={18} />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="Name of your item"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">Type</label>
                        <select
                            value={formData.product_type}
                            onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                            <option value="physical">Physical</option>
                            <option value="service">Service</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">Category</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                            <option value="">Select</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">Price (NGN)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                            <Dollar01Icon size={18} />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">Description</label>
                    <div className="relative">
                        <div className="absolute top-3 left-4 pointer-events-none text-zinc-400">
                            <File01Icon size={18} />
                        </div>
                        <textarea
                            required
                            rows={4}
                            placeholder="Description..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium text-sm resize-none"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#008000] text-white rounded-xl py-4 font-black text-sm hover:bg-zinc-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>{submitText}</span>
                        <PackageIcon size={18} />
                    </>
                )}
            </button>
        </form>
    );
}
