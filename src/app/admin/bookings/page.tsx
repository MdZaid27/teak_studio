import { redirect } from "next/navigation";
import { getAuthenticatedAdminUser } from "@/lib/auth";
import { getAllStudioBookings } from "@/lib/bookings";
import { StudioBookingsManager } from "@/components/admin/StudioBookingsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio Walkthroughs | TEAK HAUS Admin",
  description: "Manage patron atelier walkthroughs and private appointments.",
};

export default async function AdminBookingsPage() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const bookings = await getAllStudioBookings();

  return <StudioBookingsManager initialBookings={bookings} />;
}
