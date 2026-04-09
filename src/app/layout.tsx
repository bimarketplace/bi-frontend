import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
// import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import CartFloat from "@/components/layout/CartFloat";
import InstallPrompt from '@/components/layout/InstallPrompt';
import OfflineFallback from '@/components/layout/OfflineFallback';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BI",
  description: "Marketplace for your products",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
          <CartFloat />
          {/* <WhatsAppFloat /> */}
          <InstallPrompt />
          {/* <OfflineFallback /> */}
        </Providers>
      </body>
    </html>
  );
}
