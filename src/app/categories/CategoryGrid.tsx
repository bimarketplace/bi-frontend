"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/categories";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const fallbackImage = "/categoery_fallback_img.jpg";

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 md:grid-cols-4">
      {categories.map((category) => {
        const categoryImage = category.image_url || category.image || fallbackImage;

        return (
          <Link
            key={category.id}
            href={`/?category=${category.id}`}
            aria-label={`Shop ${category.name}`}
            className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008000] focus-visible:ring-offset-2"
          >
            <Image
              src={categoryImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
              onError={(event) => {
                if (event.currentTarget.src.endsWith(fallbackImage)) return;
                event.currentTarget.src = fallbackImage;
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 px-2 text-center text-xs font-medium leading-tight text-white sm:px-3 sm:text-sm">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
