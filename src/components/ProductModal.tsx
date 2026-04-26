"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Cancel01Icon, Location01Icon } from "hugeicons-react";
import { Product as ProductType } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

interface ProductModalProps {
  product: ProductType;
  onClose: () => void;
  showAddToCart?: boolean;
}

const ProductModal = ({ product, onClose, showAddToCart = true }: ProductModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsOpening(false);
    setTimeout(onClose, 300);
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      style: {
        borderRadius: "12px",
        background: "#ffffff",
        color: "#000000",
        border: "1px solid #f5f5f5",
      },
    });
    handleClose();
  };

  const handleWhatsAppCheckout = () => {
    const phoneNumber = product.seller.whatsapp_number; // Use seller's number or a default fallback
    const message = `Hello, I'm interested in purchasing listed on BI Marketplace: ${product.name}\nPrice: ₦${parseFloat(product.price || "0").toLocaleString()}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
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
        className={`relative w-full sm:w-[400px] bg-white h-[90vh] sm:h-full shadow-2xl transition-transform duration-300 ease-out flex flex-col
          ${(!isOpening || isClosing) ? 'translate-y-full sm:translate-x-full' : 'translate-y-0 sm:translate-x-0'}`}
      >
        {/* Mobile Handle */}
        <div className="sm:hidden w-full flex justify-center py-3 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-medium text-gray-900">Product Details</h3>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 bg-gray-50 rounded-full text-gray-900 transition-colors"
          >
            <Cancel01Icon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 text-center">
          <div className="relative w-64 aspect-square mx-auto rounded-xl overflow-hidden bg-gray-100 shrink-0">
             <Image
              src={product.image_url || "/assets/images/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-3 text-start px-3">
             <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
             <div className="text-2xl font-bold text-[#008000]">
               ₦{parseFloat(product.price || "0").toLocaleString()}
             </div>

             {product.seller.state_details && (
               <div className="flex items-center gap-1.5 text-zinc-500 mt-1">
                 <Location01Icon size={16} />
                 <span className="text-sm font-medium">
                   {product.seller.lga_details?.name ? `${product.seller.lga_details.name}, ` : ''}
                   {product.seller.state_details.name}
                 </span>
               </div>
             )}

             <div className="mt-4 flex flex-col gap-2">
               <h3 className="font-bold text-gray-900">Description</h3>
               <p className="text-gray-600 leading-relaxed text-sm">
                 {product.description || "No description available for this product."}
               </p>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white shrink-0 mb-4 px-8">
          {showAddToCart ? (
            <button 
              onClick={handleAddToCart}
              className="w-full bg-[#008000] text-white py-3 rounded-xl font-bold hover:bg-[#006000] transition-colors flex items-center justify-center gap-3"
            >
              Add to Cart
            </button>
          ) : (
            <div>
            <button 
              onClick={handleWhatsAppCheckout}
              className="w-full bg-[#008000] text-white py-3 rounded-xl font-bold hover:bg-[#006000] transition-colors flex items-center justify-center gap-3"
            >
              Checkout via WhatsApp
            </button>
            <a href={`/vendors/${product.seller?.username}`}>
            <button 
              className="w-full bg-[#f5f5f5] mt-3 text-gray-900 py-3 rounded-xl font-bold hover:bg-[#e5e5e5] transition-colors flex items-center justify-center gap-3"
            >
              Open Store
            </button>
            </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
