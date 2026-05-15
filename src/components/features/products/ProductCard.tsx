"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product as ProductType } from "@/lib/products";


interface ProductCardProps {
  product: ProductType;
  onSelect: (product: ProductType) => void;
}

const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col w-full h-full cursor-pointer transition-all duration-500 ease-out"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[10px] bg-[#f3f3f4] mb-3">
        <Image
          src={product.image_url || "/assets/images/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </div>

      <div className="flex flex-col flex-1 px-1 gap-1 mt-1">
        <h3 className="text-[15px] font-bold text-[#0D0C22] line-clamp-1 leading-tight">
          {product.name}
        </h3>
        
        <span className="text-[14px] font-bold text-[#008000]">
          ₦{parseFloat(product.price || "0").toLocaleString()}
        </span>
        
        <Link
          href={`/vendors/${product.seller?.username}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[13px] font-medium text-gray-500 hover:text-[#008000] transition-colors w-fit"
        >
          {product.seller?.username || 'Seller'}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
