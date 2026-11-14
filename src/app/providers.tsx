'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Toaster } from 'react-hot-toast';
import { GridProvider } from '@/context/GridContext';
import { CartProvider } from '@/context/CartContext';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !('serviceWorker' in navigator)) return;

    const clearStalePwaData = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations
          .filter((registration) => {
            const scope = new URL(registration.scope);
            return scope.origin === window.location.origin && scope.pathname === '/';
          })
          .map((registration) => registration.unregister()),
      );

      const pwaCachePrefixes = [
        'workbox-',
        'start-url',
        'google-fonts-',
        'static-',
        'next-',
        'apis',
        'pages',
        'cross-origin',
      ];
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => pwaCachePrefixes.some((prefix) => name.startsWith(prefix)))
          .map((name) => caches.delete(name)),
      );
    };

    void clearStalePwaData().catch((error: unknown) => {
      console.error('Failed to clear stale PWA data in development:', error);
    });
  }, []);

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
