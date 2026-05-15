"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Cancel01Icon, ShoppingBasket01Icon, Delete01Icon, ArrowLeft01Icon } from "hugeicons-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { Product as ProductType } from "@/lib/products";
import { submitCheckout } from "@/lib/checkout";

const CartModal = ({ onClose }: { onClose: () => void }) => {
  const { items, removeFromCart, clearCart, itemCount } = useCart();
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [step, setStep] = useState<'cart' | 'details'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phone: "",
    notes: ""
  });

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

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (step === 'cart') {
      setStep('details');
      return;
    }

    // Final checkout step
    if (!formData.fullName || !formData.address || !formData.phone) {
      toast.error("Please fill in all required fields", {
        style: { borderRadius: "12px" }
      });
      return;
    }

    const phoneNumber = items[0].product.seller.whatsapp_number;

    if (!phoneNumber) {
      toast.error("Seller's WhatsApp number not found", {
        style: { borderRadius: "12px" }
      });
      return;
    }

    setIsSubmitting(true);

    // 1. Send to backend (notifies admin)
    const backendData = {
      full_name: formData.fullName,
      address: formData.address,
      phone: formData.phone,
      notes: formData.notes,
      items_json: items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total_price: totalPrice
    };

    // We call this but don't strictly wait for it to block the user if it fails
    // However, for reliability we'll await but catch errors internally in the lib
    await submitCheckout(backendData);

    // 2. Proceed to WhatsApp
    const itemList = items
      .map(item => `- ${item.product.name} (Qty: ${item.quantity})`)
      .join('\n');

    const deliveryInfo = `
*Delivery Details:*
- Name: ${formData.fullName}
- Address: ${formData.address}
- Phone: ${formData.phone}
${formData.notes ? `- Notes: ${formData.notes}` : ''}
`;

    const message = `Hello, I'm interested in purchasing the following items listed on BI Marketplace:\n\n${itemList}\n\nTotal: ₦${totalPrice.toLocaleString()}\n${deliveryInfo}`;
    const encodedMessage = encodeURIComponent(message);

    toast.success("Proceeding to WhatsApp...", {
      style: {
        borderRadius: "12px",
        background: "#ffffff",
        color: "#000000",
        border: "1px solid #f5f5f5",
      },
    });

    setIsSubmitting(false);
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
            <h3 className="text-xl font-bold text-gray-900">Your Cart ({itemCount})</h3>
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
          ) : step === 'cart' ? (
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
          ) : (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStep('cart')} 
                  className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-all text-gray-900 active:scale-90"
                  title="Back to cart"
                >
                  <ArrowLeft01Icon size={24} />
                </button>
                <h3 className="text-2xl font-bold text-gray-900">Delivery details</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Address</label>
                  <input
                    type="text"
                    placeholder="Street, number, city"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 ..."
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Notes (Optional)</label>
                  <textarea
                    placeholder="Delivery notes (optional)"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium min-h-[100px] resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-[#f5f5f5] bg-white shrink-0 mt-auto">
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="text-gray-500 text-xs font-bold tracking-wider uppercase">{step === 'cart' ? 'Subtotal' : 'Estimated Total'}</span>
              <span className="text-2xl font-black text-gray-900">₦{totalPrice.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-[#008000] text-white py-5 rounded-[18px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-2xl shadow-[#008000]/20 hover:bg-[#006000] active:scale-[0.98] disabled:opacity-50"
            >
              <span className="uppercase tracking-widest text-[13px]">
                {isSubmitting ? 'Processing...' : (step === 'cart' ? 'Checkout via WhatsApp' : 'Confirm Order via WhatsApp')}
              </span>
              {step === 'details' && !isSubmitting && (
                <span className="text-[10px] opacity-80 font-medium normal-case">
                  Opens WhatsApp to complete your purchase.
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
