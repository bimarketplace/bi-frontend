import { fetchProductsPage } from "@/lib/products";
import { fetchCategories } from "@/lib/categories";
import VendorStore from "./VendorStore";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `${id}'s Store | BI Marketplace`,
    description: `Shop the best deals at ${id}'s official store on BI Marketplace. Discover exclusive products, secure payments, and fast delivery.`,
    openGraph: {
      title: `${id} Store - BI Marketplace`,
      description: `Browse products from ${id} on the ultimate marketplace.`,
      url: `/vendors/${id}`,
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  
  // Fetch data on the server for better SEO (SSR)
  const [productsData, categoriesData] = await Promise.all([
    fetchProductsPage(undefined, { seller__username: id }), 
    fetchCategories()
  ]);

  // Filter products to only include those from the current vendor
  // (In case the API returns a mix, though seller__username filter is used)
  const vendorProducts = productsData.results.filter(
    (p: any) => p.seller?.username === id
  );

  return (
    <VendorStore 
      id={id} 
      initialProducts={vendorProducts} 
      categoriesData={categoriesData} 
    />
  );
}
