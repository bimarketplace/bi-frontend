"use client";

import { useRouter } from "next/navigation";
import ProductModal from "@/components/ProductModal";
import type { Product } from "@/lib/products";

export default function SharedProductModal({ product }: { product: Product }) {
  const router = useRouter();

  return <ProductModal product={product} onClose={() => router.replace("/")} />;
}
