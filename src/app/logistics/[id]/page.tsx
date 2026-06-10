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
    const description = company.description || `View logistics service details for ${company.name}.`;
    const imageUrl = company.logo_url || company.logo || "/icon512_rounded.png";
    return {
      title: `${company.name} | Logistics | BI Marketplace`,
      description,
      openGraph: {
        title: `${company.name} - Logistics Partner`,
        description,
        url: `/logistics/${id}`,
        images: [
          {
            url: imageUrl,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${company.name} - Logistics Partner`,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Logistics Service | BI Marketplace",
    };
  }
}


export default async function LogisticsProfilePage({ params }: Props) {
  const { id } = await params;
  const company = await fetchLogisticsById(parseInt(id));

  return <LogisticsProfile company={company} />;
}
