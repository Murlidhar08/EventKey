import { AppHeader } from "@/components/app-header";
import { getEventDetailsAction } from "@/actions/event-actions";
import { CheckInsClient } from "@/components/check-ins-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CheckInsPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventCheckInsPage({ params }: CheckInsPageProps) {
  const { eventId } = await params;
  const res = await getEventDetailsAction(eventId);

  if (!res.success || !res.event) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto w-full">
      <AppHeader title={`Check-in Logs — ${res.event.title}`} />
      <CheckInsClient event={res.event} stats={res.stats} />
    </div>
  );
}
