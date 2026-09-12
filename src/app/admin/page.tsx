import { redirect } from "next/navigation";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getAllOrders } from "@/lib/orders";
import { OrdersManager } from "@/components/admin/OrdersManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Atelier Console | TEAK HAUS Admin",
  description: "Operational back-office console for TEAK HAUS.",
};

export default async function AdminDashboardPage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const orders = await getAllOrders();

  return <OrdersManager initialOrders={orders} />;
}
