import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import InstallPrompt from '@/components/layout/InstallPrompt';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BIMARKETPLACE",
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
          <WhatsAppFloat />
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
