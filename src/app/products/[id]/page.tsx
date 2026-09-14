import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getProducts } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return {
      title: "Heirloom Piece Not Found | TEAK HAUS",
    };
  }

  const title = `${product.name} — Solid ${product.timber || "Hardwood"}`;
  const description =
    product.tagline ||
    product.description?.slice(0, 160) ||
    "Handcrafted solid hardwood heirloom furniture piece by TEAK HAUS.";
  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `https://teakhaus.in${product.image || "/images/img_039_stitch.png"}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | TEAK HAUS`,
      description,
      url: `https://teakhaus.in/shop/${product.id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | TEAK HAUS`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/shop/${product.id}`,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Load companions from database server-side
  const allProds = await getProducts();
  const companions = allProds.filter((p) => p.id !== product.id).slice(0, 3);

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.image?.startsWith("http") ? product.image : `https://teakhaus.in${product.image}`,
    description: product.description || product.tagline,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "TEAK HAUS",
    },
    material: product.timber || "Solid Hardwood",
    offers: {
      "@type": "Offer",
      url: `https://teakhaus.in/shop/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stockStatus === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} companions={companions} />
    </>
  );
}

