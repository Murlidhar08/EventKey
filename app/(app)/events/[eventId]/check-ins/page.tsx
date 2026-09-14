import { AppHeader } from "@/components/app-header";
import { getEventDetailsAction } from "@/actions/event-actions";
import { CheckInsClient } from "@/components/check-ins-client";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/back-header";

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
    <>
      <BackHeader title={`Check-in Logs — ${res.event.title}`} />

      <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto w-full">
        <CheckInsClient event={res.event} stats={res.stats} />
      </div>
    </>
  );
}
