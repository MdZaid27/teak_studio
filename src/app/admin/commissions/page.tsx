import { redirect } from "next/navigation";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getAllBespokeInquiries } from "@/lib/interactions";
import { CommissionsManager } from "@/components/admin/CommissionsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bespoke Commissions | TEAK HAUS Admin",
  description: "Curate architectural commissions, timber choices, and client briefs.",
};

export default async function AdminCommissionsPage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const inquiries = await getAllBespokeInquiries();

  return <CommissionsManager initialInquiries={inquiries} />;
}
