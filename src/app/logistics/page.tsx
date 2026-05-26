import LogisticsList from "@/components/LogisticsList";
import { fetchLogistics } from "@/lib/logistics";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Logistics | BI Marketplace",
  description: "Browse available logistics partners and open their profiles to see service details.",
};

export default async function LogisticsPage() {
  const initialCompanies = await fetchLogistics();

  return <LogisticsList initialCompanies={initialCompanies} />;
}
