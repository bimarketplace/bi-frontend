import VendorsClient from "./VendorsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Vendors | BI Marketplace",
  description: "Explore verified vendors and sellers on BI Marketplace. Shop their storefronts directly.",
  openGraph: {
    title: "Verified Vendors - BI Marketplace",
    description: "Browse and discover trusted sellers on the ultimate marketplace.",
    url: "/vendors",
    type: "website",
    images: [
      {
        url: "/icon512_rounded.png",
        width: 512,
        height: 512,
        alt: "BI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Vendors - BI Marketplace",
    description: "Browse and discover trusted sellers on the ultimate marketplace.",
    images: ["/icon512_rounded.png"],
  },
};

interface PageProps {
  params: Promise<any>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  return <VendorsClient params={params} searchParams={searchParams} />;
}
