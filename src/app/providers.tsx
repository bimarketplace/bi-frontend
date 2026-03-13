'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Toaster } from 'react-hot-toast';
import { GridProvider } from '@/context/GridContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <GridProvider>
        {children}
        <Toaster position="top-right" />
      </GridProvider>
    </SessionProvider>
  );
}
