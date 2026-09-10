import { getProducts } from "@/lib/products";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const initialProducts = await getProducts();

  return <ShopClient initialProducts={initialProducts} />;
}

