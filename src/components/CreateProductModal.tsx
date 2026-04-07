"use client";

import React, { useState, useEffect } from "react";
import { Cancel01Icon } from "hugeicons-react";
import { createProduct } from "@/lib/products";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ProductForm from "./forms/ProductForm";
import { useRouter } from "next/navigation";

interface CreateProductModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateProductModal = ({ onClose, onSuccess }: CreateProductModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsOpening(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (formData: any) => {
    if (!session?.access_token) {
        toast.error("Please sign in to list a product");
        return;
    }

    setIsLoading(true);
    try {
        await createProduct(formData, (session as any).access_token);
        toast.success("Product listed successfully!", {
          style: {
            borderRadius: "12px",
            background: "#ffffff",
            color: "#000000",
            border: "1px solid #f5f5f5",
          },
        });
        if (onSuccess) onSuccess();
        handleClose();
        router.refresh();
    } catch (error: any) {
        console.error("List error:", error);
        const msg = error.response?.data?.detail || "Failed to list product";
        toast.error(msg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-stretch sm:justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-[#008000]/5 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div 
        className={`relative w-full sm:w-[450px] bg-white h-[90vh] sm:h-full shadow-2xl transition-transform duration-300 ease-out flex flex-col
          ${(!isOpening || isClosing) ? 'translate-y-full sm:translate-x-full' : 'translate-y-0 sm:translate-x-0'}`}
      >
        {/* Mobile Handle */}
        <div className="sm:hidden w-full flex justify-center py-3 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between shrink-0 border-b border-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 bg-gray-50 rounded-full text-gray-900 transition-colors"
          >
            <Cancel01Icon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            <ProductForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                submitText="List Item Now" 
            />
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;
