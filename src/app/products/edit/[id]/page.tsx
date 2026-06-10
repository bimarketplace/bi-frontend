import EditProductClient from "./EditProductClient";
import { fetchProductById } from "@/lib/products";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await fetchProductById(parseInt(id));
    return {
      title: `Edit ${product.name} | BI Marketplace`,
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch {
    return {
      title: "Edit Product | BI Marketplace",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function Page({ params }: Props) {
  return <EditProductClient params={params} />;
}
