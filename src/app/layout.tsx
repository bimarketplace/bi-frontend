import React, { Suspense } from "react";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "BI - The Ultimate Marketplace",
  description: "Discover BI, the ultimate marketplace for all your products. Shop from a wide range of verified sellers, enjoy secure payments, fast delivery, and top-notch customer support.",
  keywords: ["marketplace", "ecommerce", "shopping", "buy online", "sell online", "BI marketplace", "products"],
  manifest: "/manifest.json",
  openGraph: {
    title: "BI - The Ultimate Marketplace",
    description: "Discover BI, the ultimate marketplace for all your products. Shop from a wide range of verified sellers, enjoy secure payments, fast delivery, and top-notch customer support.",
    url: "/",
    siteName: "BI Marketplace",
    images: [
      {
        url: "/icon512_rounded.png", // Assuming this acts as our logo, adjust if there's a specific logo URL
        width: 512,
        height: 512,
        alt: "BI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BI - The Ultimate Marketplace",
    description: "Discover BI, the ultimate marketplace for all your products. Shop from a wide range of verified sellers, enjoy secure payments, fast delivery, and top-notch customer support.",
    images: ["/icon512_rounded.png"],
  },
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
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main id="main-content">
            {children}
          </main>
          <CartFloat />
          {/* <WhatsAppFloat /> */}
          <InstallPrompt />
          {/* <OfflineFallback /> */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "BI Marketplace",
                "url": "https://www.bimarketplace.org",
                "logo": "https://www.bimarketplace.org/icon512_rounded.png",
                "description": "The ultimate marketplace for all your products. Shop from verified sellers.",
                "sameAs": [
                  "https://twitter.com/bimarketplace",
                  "https://instagram.com/bimarketplace"
                ]
              }),
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
