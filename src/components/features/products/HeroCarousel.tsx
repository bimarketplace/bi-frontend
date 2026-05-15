"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar } from "@/components/layout/Navbar";
import { Product as ProductType } from "@/lib/products";

const HeroCarousel = ({ products }: { products: ProductType[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (!products || products.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-[#008000] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {products.map((product, index) => (
        <div
          key={product.id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={product.image_url || "/assets/images/sale-fast.png"}
            alt={product.name || "Product"}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/assets/images/placeholder.png";
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <h3 className="text-white font-bold text-lg line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
                <Avatar name={product.seller?.username || 'U'} size="xs" variant="light" className="ring-1 ring-white/20" />
                <span className="text-white/90 font-medium text-sm">
                    {product.seller?.username || 'Seller'} • ₦{parseFloat(product.price || "0").toLocaleString()}
                </span>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {products.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all shadow-sm ${
              idx === currentIndex ? "bg-white scale-125" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
