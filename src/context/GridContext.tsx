"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type GridColumns = 1 | 2 | 3;

interface GridContextType {
  columns: GridColumns;
  toggleColumns: () => void;
}

const GridContext = createContext<GridContextType | undefined>(undefined);

export function GridProvider({ children }: { children: React.ReactNode }) {
  const [columns, setColumns] = useState<GridColumns>(3);

  // Initialize from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("product-grid-columns");
    if (saved) {
      setColumns(parseInt(saved) as GridColumns);
    }
  }, []);

  const toggleColumns = () => {
    setColumns((prev) => {
      let next: GridColumns;
      if (prev === 1) next = 2;
      else if (prev === 2) next = 3;
      else next = 1;
      
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
