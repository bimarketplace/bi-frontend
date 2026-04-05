'use client';

import { useState } from 'react';
import Products from '@/components/Products';
import { Product as ProductType } from "@/lib/products";
import { Category } from "@/lib/categories";

const tabs = [
  { id: 'tab1', label: 'Products' },
  { id: 'tab2', label: 'Services' },
  // { id: 'tab3', label: 'Vendors' },
];

interface TabsProps {
  productsProps?: {
    initialProducts: ProductType[] | null | undefined;
    categories: Category[] | null | undefined;
    initialNext?: string | null;
    initialPrev?: string | null;
    initialCount?: number;
  };
}

export default function Tabs({ productsProps }: TabsProps) {
  const [activeTab, setActiveTab] = useState('tab1');

  const tabContent = {
    tab1: (
      <Products 
        initialProducts={productsProps?.initialProducts}
        categories={productsProps?.categories}
        initialCount={productsProps?.initialCount}
        initialNext={productsProps?.initialNext}
        initialPrev={productsProps?.initialPrev}
      />
    ),
    tab2: (
      <div>
        <p className="text-gray-600 text-center py-20">This feature is unavailable at the moment.</p>
      </div>
    ),
  };

  return (
    <div className="">
      {/* Tab Buttons */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-4 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#008800] text-[#008800]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {tabContent[activeTab as keyof typeof tabContent]}
      </div>
    </div>
  );
}