import { notFound } from "next/navigation";
import { getProductById, getProducts } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
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

  return <ProductDetailClient product={product} companions={companions} />;
}
