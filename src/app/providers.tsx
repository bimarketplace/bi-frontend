'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Toaster } from 'react-hot-toast';
import { GridProvider } from '@/context/GridContext';
import { CartProvider } from '@/context/CartContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <GridProvider>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'font-sans text-sm font-semibold',
              style: {
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #f5f5f5',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#008000',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </GridProvider>
      </CartProvider>
    </SessionProvider>
  );
}
