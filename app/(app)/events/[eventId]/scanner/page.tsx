import { AppHeader } from "@/components/app-header";
import { getEventDetailsAction } from "@/actions/event-actions";
import { AdminScannerClient } from "@/components/admin-scanner-client";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/back-header";

export const dynamic = "force-dynamic";

interface ScannerPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function GateScannerPage({ params }: ScannerPageProps) {
  const { eventId } = await params;
  const res = await getEventDetailsAction(eventId);

  if (!res.success || !res.event) {
    notFound();
  }

  return (
    <>
      <BackHeader title={`Gate Scanner — ${res.event.title}`} />

      <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto w-full">
        <AdminScannerClient event={res.event} />
      </div>
    </>
  );
}
