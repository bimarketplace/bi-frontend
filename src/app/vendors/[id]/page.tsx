import { fetchProductsPage } from "@/lib/products";
import { fetchCategories } from "@/lib/categories";
import VendorStore from "./VendorStore";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let bio = `Shop the best deals at ${id}'s official store on BI Marketplace. Discover exclusive products, secure payments, and fast delivery.`;
  let avatarUrl = "/icon512_rounded.png";

  try {
    const productsData = await fetchProductsPage(undefined, { seller__username: id, page_size: 1 });
    if (productsData.results && productsData.results.length > 0) {
      const seller = productsData.results[0].seller;
      if (seller.bio) {
        bio = seller.bio;
      }
      if (seller.avatar_url) {
        avatarUrl = seller.avatar_url;
      } else if (seller.avatar) {
        avatarUrl = seller.avatar;
      }
    }
  } catch (error) {
    console.error("Failed to load seller info for metadata:", error);
  }

  return {
    title: `${id}'s Store | BI Marketplace`,
    description: bio,
    openGraph: {
      title: `${id} Store - BI Marketplace`,
      description: bio,
      url: `/vendors/${id}`,
      images: [
        {
          url: avatarUrl,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${id} Store - BI Marketplace`,
      description: bio,
      images: [avatarUrl],
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
