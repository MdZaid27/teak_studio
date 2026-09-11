import { redirect } from "next/navigation";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getAllNewsletterSubscribers } from "@/lib/interactions";
import { NewsletterManager } from "@/components/admin/NewsletterManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Newsletter Patrons | KILN STUDIO Admin",
  description: "Curated patrons receiving the KILN STUDIO Atelier Journal and invitations.",
};

export default async function AdminNewsletterPage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { subscribers, totalCount, activeCount } = await getAllNewsletterSubscribers();

  return (
    <NewsletterManager
      initialSubscribers={subscribers}
      initialTotalCount={totalCount}
      initialActiveCount={activeCount}
    />
  );
}
