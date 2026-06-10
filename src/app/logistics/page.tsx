import LogisticsList from "@/components/LogisticsList";
import { fetchLogistics } from "@/lib/logistics";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Logistics | BI Marketplace",
  description: "Browse available logistics partners and open their profiles to see service details.",
  openGraph: {
    title: "Logistics Partners - BI Marketplace",
    description: "Browse available logistics partners and open their profiles to see service details.",
    url: "/logistics",
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
    title: "Logistics Partners - BI Marketplace",
    description: "Browse available logistics partners and open their profiles to see service details.",
    images: ["/icon512_rounded.png"],
  },
};


export default async function LogisticsPage() {
  const initialCompanies = await fetchLogistics();

  return <LogisticsList initialCompanies={initialCompanies} />;
}
