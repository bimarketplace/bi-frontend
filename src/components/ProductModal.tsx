"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Cancel01Icon, Location01Icon, ArrowLeft01Icon } from "hugeicons-react";
import { Product as ProductType } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { submitCheckout } from "@/lib/checkout";

interface ProductModalProps {
  product: ProductType;
  onClose: () => void;
  showAddToCart?: boolean;
}

const ProductModal = ({ product, onClose, showAddToCart = true }: ProductModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const { addToCart } = useCart();
  const [step, setStep] = useState<'product' | 'details'>('product');
  const [quantity, setQuantity] = useState(1);
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

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity}x ${product.name} added to cart!`, {
      style: {
        borderRadius: "12px",
        background: "#ffffff",
        color: "#000000",
        border: "1px solid #f5f5f5",
      },
    });
    handleClose();
  };

  const handleWhatsAppCheckout = async () => {
    if (step === 'product') {
      setStep('details');
      return;
    }

    if (!formData.fullName || !formData.address || !formData.phone) {
      toast.error("Please fill in all required fields", {
        style: { borderRadius: "12px" }
      });
      return;
    }

    setIsSubmitting(true);

    const total = parseFloat(product.price || "0") * quantity;

    // 1. Send to backend
    const backendData = {
      full_name: formData.fullName,
      address: formData.address,
      phone: formData.phone,
      notes: formData.notes,
      items_json: [{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity
      }],
      total_price: total
    };

    await submitCheckout(backendData);

    // 2. Proceed to WhatsApp
    const phoneNumber = product.seller.whatsapp_number;
    const deliveryInfo = `
*Delivery Details:*
- Name: ${formData.fullName}
- Address: ${formData.address}
- Phone: ${formData.phone}
${formData.notes ? `- Notes: ${formData.notes}` : ''}
`;

    const message = `Hello, I'm interested in purchasing the following item listed on BI Marketplace:\n\n- ${product.name} (Qty: ${quantity})\n\nPrice: ₦${total.toLocaleString()}\n${deliveryInfo}`;
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
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {step === 'product' ? (
            <>
              <div className="relative w-64 aspect-square mx-auto rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                <Image
                  src={product.image_url || "/assets/images/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-3 text-start px-3">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="text-2xl font-black text-[#008000]">
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

                {/* Quantity Selector */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">Quantity</span>
                    <span className="text-xs text-zinc-500">Select number of items</span>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-full border border-gray-100">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 font-bold hover:bg-gray-100 active:scale-90 transition-all shadow-sm border border-gray-100"
                    >
                      -
                    </button>
                    <span className="text-base font-bold w-6 text-center text-gray-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 font-bold hover:bg-gray-100 active:scale-90 transition-all shadow-sm border border-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <h3 className="font-bold text-gray-900">Description</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {product.description || "No description available for this product."}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStep('product')} 
                  className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-all text-gray-900 active:scale-90"
                  title="Back"
                >
                  <ArrowLeft01Icon size={24} />
                </button>
                <h3 className="text-2xl font-bold text-gray-900">Delivery details</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Address</label>
                  <input
                    type="text"
                    placeholder="Street, number, city"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 ..."
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5 text-left">
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

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-white shrink-0 mb-4 px-8 border-t border-gray-50">
          {step === 'details' && (
             <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-gray-500 text-xs font-bold tracking-wider uppercase">Estimated Total</span>
                <span className="text-2xl font-black text-gray-900">₦{(parseFloat(product.price || "0") * quantity).toLocaleString()}</span>
             </div>
          )}

          {showAddToCart && step === 'product' ? (
            <button 
              onClick={handleAddToCart}
              className="w-full bg-[#008000] text-white py-4 rounded-[18px] font-black hover:bg-[#006000] transition-colors flex items-center justify-center gap-3 shadow-xl shadow-[#008000]/10"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleWhatsAppCheckout}
                disabled={isSubmitting}
                className="w-full bg-[#008000] text-white py-5 rounded-[18px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-2xl shadow-[#008000]/20 hover:bg-[#006000] active:scale-[0.98] disabled:opacity-50"
              >
                <span className="uppercase tracking-widest text-[13px]">
                  {isSubmitting ? 'Processing...' : (step === 'product' ? 'Checkout via WhatsApp' : 'Confirm Order via WhatsApp')}
                </span>
                {step === 'details' && !isSubmitting && (
                  <span className="text-[10px] opacity-80 font-medium normal-case">
                    Opens WhatsApp to complete your purchase.
                  </span>
                )}
              </button>
              
              {step === 'product' && (
                <a href={`/vendors/${product.seller?.username}`} className="w-full">
                  <button 
                    className="w-full bg-[#f5f5f5] text-gray-900 py-4 rounded-[18px] font-bold hover:bg-[#e5e5e5] transition-colors flex items-center justify-center gap-3"
                  >
                    Open Store
                  </button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
