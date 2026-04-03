"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type GridColumns = 1 | 2 | 3 | 4;

interface GridContextType {
  columns: GridColumns | 'auto';
  toggleColumns: () => void;
}

const GridContext = createContext<GridContextType | undefined>(undefined);

export function GridProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [columns, setColumns] = useState<GridColumns | 'auto'>('auto');

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("product-grid-columns");
    if (saved && saved !== 'auto') {
      setColumns(parseInt(saved) as GridColumns);
    }
  }, []);

  if (!mounted) {
    // Return the same structure but with default values to avoid mismatch
    return (
      <GridContext.Provider value={{ columns: 'auto', toggleColumns: () => {} }}>
        {children}
      </GridContext.Provider>
    );
  }

  const toggleColumns = () => {
    setColumns((prev) => {
      let next: GridColumns | 'auto';
      if (prev === 'auto') next = 1;
      else if (prev === 1) next = 2;
      else if (prev === 2) next = 3;
      else if (prev === 3) next = 4;
      else next = 'auto';
      
      localStorage.setItem("product-grid-columns", next.toString());
      return next;
    });
  };

  return (
    <GridContext.Provider value={{ columns, toggleColumns }}>
      {children}
    </GridContext.Provider>
  );
}

export function useGrid() {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error("useGrid must be used within a GridProvider");
  }
  return context;
}
