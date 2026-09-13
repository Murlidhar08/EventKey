import { AppHeader } from "@/components/app-header";
import { getEventDetailsAction } from "@/actions/event-actions";
import { PassManagementClient } from "@/components/pass-management-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PassesPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventPassesPage({ params }: PassesPageProps) {
  const { eventId } = await params;
  const res = await getEventDetailsAction(eventId);

  if (!res.success || !res.event) {
    notFound();
  }

  const { event } = res;

  return (
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto w-full">
      <AppHeader title={`Passes — ${event.title}`} />
      <PassManagementClient event={event} />
    </div>
  );
}
