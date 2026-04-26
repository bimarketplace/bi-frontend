import { fetchProductById } from "@/lib/products";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await fetchProductById(parseInt(id));
    
    return {
      title: `${product.name} | BI Marketplace`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [{ url: product.image_url || "/assets/images/sale-fast.png" }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description,
        images: [product.image_url || "/assets/images/sale-fast.png"],
      },
    };
  } catch (error) {
    return {
      title: "Product Not Found | BI Marketplace",
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(parseInt(id));

  // JSON-LD for Product
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "NGN",
      "availability": "https://schema.org/InStock",
      "url": `https://www.bimarketplace.org/products/${id}`
    },
    "seller": {
      "@type": "Person",
      "name": product.seller.username
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails initialProduct={product} id={id} />
    </>
  );
}
