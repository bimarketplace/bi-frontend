import { fetchProductById } from "@/lib/products";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import SharedProductModal from "./SharedProductModal";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ openModal?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await fetchProductById(parseInt(id));
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.bimarketplace.org";
    const imageUrl = new URL(
      product.image_url || "/assets/images/sale-fast.png",
      siteUrl
    ).toString();
    
    return {
      title: `${product.name} | BI Marketplace`,
      description: product.description,
      openGraph: {
        title: `${product.name} | BI Marketplace`,
        description: product.description,
        url: new URL(`/products/${id}?openModal=1`, siteUrl).toString(),
        images: [{ url: imageUrl, alt: product.name }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | BI Marketplace`,
        description: product.description,
        images: [{ url: imageUrl, alt: product.name }],
      },
    };
  } catch (error) {
    return {
      title: "Product Not Found | BI Marketplace",
    };
  }
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { openModal } = await searchParams;
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
      {openModal === "1" ? (
        <SharedProductModal product={product} />
      ) : (
        <ProductDetails initialProduct={product} id={id} />
      )}
    </>
  );
}
