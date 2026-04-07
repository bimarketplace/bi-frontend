"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Cancel01Icon, ShoppingBasket01Icon, Delete01Icon } from "hugeicons-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

const CartModal = ({ onClose }: { onClose: () => void }) => {
  const { items, removeFromCart, clearCart, itemCount } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsOpening(false);
    setTimeout(onClose, 300);
  };

  const totalPrice = items.reduce(
    (acc, item) => acc + parseFloat(item.product.price || "0") * item.quantity,
    0
  );

  const handleCheckout = () => {
    const phoneNumber = "2349124848282";
    const itemList = items.map(item => `- ${item.product.name} (Qty: ${item.quantity})`).join('\n');
    const message = `Hello, I'm interested in purchasing the following items:\n\n${itemList}\n\nTotal: ₦${totalPrice.toLocaleString()}`;
    const encodedMessage = encodeURIComponent(message);
    
    toast.success("Proceeding to checkout...", {
       style: {
        borderRadius: "12px",
        background: "#ffffff",
        color: "#000000",
        border: "1px solid #f5f5f5",
      },
    });

    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-stretch sm:justify-end overflow-hidden">
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
          <div className="flex items-center gap-3">
            <ShoppingBasket01Icon className="text-[#008000]" size={24} />
            <h3 className="text-xl font-medium text-gray-900">Your Cart ({itemCount})</h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 bg-gray-50 rounded-full text-gray-900 transition-colors"
          >
            <Cancel01Icon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
              <ShoppingBasket01Icon size={48} className="opacity-20" />
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={item.product.image_url || "/assets/images/placeholder.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                  <p className="text-sm font-bold text-[#008000]">
                    ₦{(parseFloat(item.product.price || "0") * item.quantity).toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors self-center"
                >
                  <Delete01Icon size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-[#f5f5f5] bg-white shrink-0 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">₦{totalPrice.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-[#008000] text-white py-3.5 rounded-xl font-bold hover:bg-[#006000] transition-colors flex items-center justify-center gap-3 shadow-[0_4px_14px_rgba(0,128,0,0.2)]"
            >
              Proceed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
