"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Cancel01Icon, Location01Icon, ArrowLeft01Icon, MinusSignIcon, PlusSignIcon, Share01Icon } from "hugeicons-react";
import { Product as ProductType } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { submitCheckout } from "@/lib/checkout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { startConversation } from "@/lib/chat";

interface ProductModalProps {
  product: ProductType;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const { addToCart } = useCart();
  const [step, setStep] = useState<'product' | 'details'>('product');
  const [isStartingChat, setIsStartingChat] = useState(false);
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

  const handleShare = async () => {
    const productUrl = new URL(`/products/${product.id}?openModal=1`, window.location.origin).toString();
    const shareData = {
      title: product.name,
      text: product.name,
      url: productUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Failed to share product:", error);
        toast.error("Unable to share this product");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      toast.success("Product link copied");
    } catch (error) {
      console.error("Failed to copy product link:", error);
      toast.error("Unable to share or copy the product link");
    }
  };

  const handleChatSeller = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to chat with the seller");
      return;
    }

    setIsStartingChat(true);
    const toastId = toast.loading("Starting chat...");
    try {
      const conversation = await startConversation(
        product.seller.id,
        product.id,
        (session as any).access_token
      );
      toast.success("Chat started", { id: toastId });
      handleClose();
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      toast.error("Failed to start chat", { id: toastId });
      setIsStartingChat(false);
    }
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
    <div className="fixed inset-0 z-[120] flex items-end overflow-hidden sm:items-stretch sm:justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[#008000]/5 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} details`}
        className={`relative flex h-[100dvh] w-full flex-col bg-white pt-[env(safe-area-inset-top)] shadow-2xl transition-transform duration-300 ease-out sm:h-full sm:w-[480px]
          ${(!isOpening || isClosing) ? 'translate-y-full sm:translate-x-full' : 'translate-y-0 sm:translate-x-0'}`}
      >
        <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-zinc-200 px-5 sm:justify-between sm:px-6">
          <button
            onClick={handleClose}
            aria-label="Close product details"
            className="flex h-9 w-6 items-center justify-start text-zinc-900 transition-colors hover:text-[#008000]"
          >
            <ArrowLeft01Icon size={22} />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
          <button
            onClick={handleClose}
            aria-label="Close product details"
            className="ml-auto hidden rounded-full bg-gray-50 p-2 text-gray-900 transition-colors hover:bg-gray-100 sm:block"
          >
            <Cancel01Icon size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain pb-5">
          {step === 'product' ? (
            <>
              <div className="flex min-h-[72px] items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#008000]/10 text-sm font-bold text-[#008000]">
                    {product.seller?.avatar_url || product.seller?.avatar ? (
                      <Image
                        src={product.seller.avatar_url || product.seller.avatar || ""}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      product.seller?.username?.charAt(0).toUpperCase() || "S"
                    )}
                  </span>
                  <span className="truncate text-sm font-medium text-zinc-900">
                    {product.seller?.username || "Seller"}
                  </span>
                </span>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label={`Share ${product.name}`}
                    title="Share product"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-900 transition-colors hover:bg-zinc-100"
                  >
                    <Share01Icon size={20} />
                  </button>
                  <a
                    href={`/vendors/${product.seller?.username}`}
                    className="rounded-full border border-black px-4 py-2 text-sm font-semibold text-black shadow-[0_2px_0_#000]"
                  >
                    View store
                  </a>
                </div>
              </div>

              <div className="mx-5 mt-5 flex aspect-square max-h-[360px] items-center justify-center overflow-hidden rounded-[30px] bg-zinc-100 sm:mx-6">
                <div className="relative h-full w-full">
                  <Image
                    src={product.image_url || "/assets/images/placeholder.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 90vw, 430px"
                    className="object-contain p-4"
                    unoptimized
                  />
                </div>
              </div>

              <div className="px-5 pt-5 sm:px-6">
                <h1 className="text-lg font-semibold text-zinc-950">{product.name}</h1>
                <p className="mt-1 text-lg font-semibold text-[#008000]">
                  ₦{parseFloat(product.price || "0").toLocaleString()}
                </p>
                {product.category?.name && (
                  <p className="mt-1 text-sm text-zinc-600">{product.category.name}</p>
                )}
                {(product.seller?.lga_details?.name || product.seller?.state_details?.name) && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
                    <Location01Icon size={16} />
                    {[product.seller.lga_details?.name, product.seller.state_details?.name]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-y border-zinc-200 py-4">
                  <span className="text-sm font-medium text-zinc-900">Quantity</span>
                  <div className="flex items-center gap-3 rounded-full border border-zinc-300 px-2 py-1">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="flex h-7 w-7 items-center justify-center text-zinc-500 disabled:opacity-40"
                      disabled={quantity <= 1}
                    >
                      <MinusSignIcon size={16} />
                    </button>
                    <span className="w-5 text-center text-sm font-medium text-zinc-900">{quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="flex h-7 w-7 items-center justify-center text-zinc-500"
                    >
                      <PlusSignIcon size={16} />
                    </button>
                  </div>
                </div>

                <section className="border-b border-zinc-200 py-5">
                  <h2 className="text-sm font-semibold text-zinc-950">Description</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                    {product.description || "No description available for this product."}
                  </p>
                </section>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6 px-5 pt-6 animate-in slide-in-from-right duration-300 sm:px-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("product")}
                  aria-label="Back to product details"
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-zinc-100"
                >
                  <ArrowLeft01Icon size={20} />
                </button>
                <h3 className="text-xl font-bold text-gray-900">Delivery details</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Address</label>
                  <input
                    type="text"
                    placeholder="Street, number, city"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 ..."
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-900 tracking-wider uppercase">Notes (Optional)</label>
                  <textarea
                    placeholder="Delivery notes (optional)"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[18px] text-sm focus:outline-none focus:ring-4 focus:ring-[#008000]/5 focus:bg-white focus:border-[#008000] transition-all font-medium min-h-[100px] resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-zinc-200 bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 sm:px-6 sm:py-5">
          {step === 'details' && (
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-sm font-medium text-zinc-600">Estimated total</span>
              <span className="text-lg font-bold text-gray-900">₦{(parseFloat(product.price || "0") * quantity).toLocaleString()}</span>
            </div>
          )}

          {step === 'product' ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="min-h-[52px] w-full rounded-full border border-black bg-[#008000] text-sm font-semibold text-white shadow-[0_3px_0_#000] transition-transform active:translate-y-0.5"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="min-h-[52px] w-full rounded-full border border-black bg-white text-sm font-semibold text-zinc-950 shadow-[0_3px_0_#000] transition-transform active:translate-y-0.5"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleChatSeller}
                disabled={isStartingChat}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-black bg-white text-sm font-semibold text-zinc-950 shadow-[0_3px_0_#000] transition-transform active:translate-y-0.5 disabled:opacity-50"
              >
                {isStartingChat ? "Starting chat..." : "Message Vendor"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              disabled={isSubmitting}
              className="min-h-[52px] w-full rounded-full border border-black bg-[#008000] text-sm font-semibold text-white shadow-[0_3px_0_#000] transition-transform active:translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Confirm Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
