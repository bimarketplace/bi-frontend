'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" />
    </SessionProvider>
  );
}
