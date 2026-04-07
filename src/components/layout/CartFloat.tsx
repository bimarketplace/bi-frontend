"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBasket01Icon } from "hugeicons-react";
import { useCart } from "@/context/CartContext";
import CartModal from "@/components/cart/CartModal";

const CartFloat = () => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Show only on vendor related pages
  const isVendorPage = pathname?.includes('/vendors');
  
  // Show only if there are items in the cart
  if (!isVendorPage || itemCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsCartModalOpen(true)}
        className="fixed bottom-24 right-6 z-[100] group flex items-center"
        aria-label="View Cart"
      >
        {/* Tooltip/Message label */}
        <div className="mr-3 px-4 py-2 bg-white text-[#008000] text-[13px] font-bold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 border border-zinc-100 pointer-events-none whitespace-nowrap hidden sm:block">
          Review Selection ({itemCount})
        </div>
        
        {/* Cart Icon Circle with Pulse Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#008000] rounded-full opacity-25"></div>
          <div className="relative w-14 h-14 bg-[#ffffff] border border-3 border-[#f5f5f5] rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-300">
            <ShoppingBasket01Icon color="#008000" size={28} />
            
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
              {itemCount}
            </div>
          </div>
        </div>
      </button>

      {isCartModalOpen && (
        <CartModal onClose={() => setIsCartModalOpen(false)} />
      )}
    </>
  );
};

export default CartFloat;
