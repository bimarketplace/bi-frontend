import { fetchLogisticsById } from "@/lib/logistics";
import LogisticsProfile from "@/components/LogisticsProfile";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const company = await fetchLogisticsById(parseInt(id));
    return {
      title: `${company.name} | Logistics | BI Marketplace`,
      description: company.description || `View logistics service details for ${company.name}.`,
    };
  } catch {
    return {
      title: "Logistics service | BI Marketplace",
    };
  }
}

export default async function LogisticsProfilePage({ params }: Props) {
  const { id } = await params;
  const company = await fetchLogisticsById(parseInt(id));

  return <LogisticsProfile company={company} />;
}
