import { redirect } from "next/navigation";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getAllSwatchRequests } from "@/lib/interactions";
import { SwatchesManager } from "@/components/admin/SwatchesManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Swatch Box Requests | TEAK HAUS Admin",
  description: "Curate and dispatch solid wood material sample boxes to patrons.",
};

export default async function AdminSwatchesPage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const requests = await getAllSwatchRequests();

  return <SwatchesManager initialRequests={requests} />;
}
