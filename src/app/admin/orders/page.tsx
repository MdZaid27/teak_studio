import { redirect } from "next/navigation";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getAllOrders } from "@/lib/orders";
import { OrdersManager } from "@/components/admin/OrdersManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Commissioned Orders | TEAK HAUS Atelier Console",
  description: "Manage solid wood retail commissions, status lifecycles, and white-glove placement.",
};

export default async function AdminOrdersPage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const orders = await getAllOrders();

  return <OrdersManager initialOrders={orders} />;
}
