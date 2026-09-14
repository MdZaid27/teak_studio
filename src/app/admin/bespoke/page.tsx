import { redirect } from "next/navigation";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getAllBespokeInquiries } from "@/lib/interactions";
import { CommissionsManager } from "@/components/admin/CommissionsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bespoke Inquiries | TEAK HAUS Admin",
  description: "Manage architectural joinery commissions and custom patron requests.",
};

export default async function AdminBespokePage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const inquiries = await getAllBespokeInquiries();

  return <CommissionsManager initialInquiries={inquiries} />;
}
