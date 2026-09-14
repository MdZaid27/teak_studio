import { redirect } from "next/navigation";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getAllProductsAdmin } from "@/lib/products";
import { ProductsManager } from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Atelier Furniture Catalog | TEAK HAUS Atelier Console",
  description: "Manage heirloom solid hardwood collections, timber finishes, and inventory.",
};

export default async function AdminProductsPage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const products = await getAllProductsAdmin();

  return <ProductsManager initialProducts={products} />;
}
