import React from "react";
import { Category } from "@/lib/categories";

interface CategoryFiltersProps {
  categoriesState: Category[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
}

export default function CategoryFilters({
  categoriesState,
  selectedCategoryId,
  setSelectedCategoryId
}: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 pt-1 px-1 mt-4 no-scrollbar scroll-smooth snap-x">
      <button
        onClick={() => setSelectedCategoryId(null)}
        className={`flex-none py-2 px-4 rounded-full border transition-all duration-300 snap-start
          ${selectedCategoryId === null
            ? "bg-[#008000] text-white shadow-[0_4px_15px_rgba(0,128,0,0.1)]"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
          }`}
      >
        <span className={`text-[12px] font-medium transition-colors ${selectedCategoryId === null ? "text-white" : "text-gray-700"}`}>
          All Products
        </span>
      </button>

      {categoriesState.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategoryId(category.id)}
          className={`flex-none w-fit py-2 px-4 rounded-full border transition-all duration-300 flex items-center gap-3 text-left group
            ${selectedCategoryId === category.id
              ? "text-white bg-[#008000] shadow-[0_4px_15_rgba(0,128,0,0.1)]"
              : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
        >
          <span className={`text-[12px] font-medium transition-colors ${selectedCategoryId === category.id ? "text-white" : "text-gray-700"}`}>
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
}
