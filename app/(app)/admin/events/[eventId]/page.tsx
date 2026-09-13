import { AppHeader } from "@/components/app-header";
import { getEventDetailsAction } from "@/actions/event-actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Ticket, Scan, CheckCircle2, ShieldX, MapPin, Users, Activity, Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const res = await getEventDetailsAction(eventId);

  if (!res.success || !res.event) {
    notFound();
  }

  const { event, stats } = res;

  return (
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto w-full">
      <AppHeader title={`Event: ${event.title}`} />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-purple-950/40 p-8 border border-zinc-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" /> ID: {event.id}
            </span>
            <h1 className="text-3xl font-black text-white">{event.title}</h1>
            {event.location && (
              <p className="text-sm text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-500" /> {event.location}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/events/${event.id}/passes`}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" /> Manage Passes ({event._count.passes})
            </Link>
            <Link
              href={`/admin/events/${event.id}/scanner`}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-pink-600 hover:bg-pink-500 text-white transition-all shadow-md flex items-center gap-2"
            >
              <Scan className="w-4 h-4" /> Open Gate Scanner
            </Link>
            <Link
              href={`/admin/events/${event.id}/check-ins`}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-emerald-400" /> Check-in Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Total Issued Passes</span>
          <p className="mt-2 text-2xl font-bold text-white">{event._count.passes}</p>
          <span className="text-[11px] text-zinc-500 font-medium">Capacity: {event.capacity}</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Active Passes</span>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{stats?.activePassesCount || 0}</p>
          <span className="text-[11px] text-zinc-500 font-medium">Unscanned & Ready</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Used / Checked-In</span>
          <p className="mt-2 text-2xl font-bold text-purple-400">{stats?.approvedCount || 0}</p>
          <span className="text-[11px] text-zinc-500 font-medium">Atomic Gate Scans</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Scan Rejections</span>
          <p className="mt-2 text-2xl font-bold text-rose-400">{stats?.deniedCount || 0}</p>
          <span className="text-[11px] text-zinc-500 font-medium">Double-scans / Invalid</span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Passes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-400" /> Recent Issued Passes
            </h2>
            <Link
              href={`/admin/events/${event.id}/passes`}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Manage Passes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            {event.passes.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No passes issued yet</p>
            ) : (
              event.passes.slice(0, 6).map((pass: any) => (
                <div
                  key={pass.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white">{pass.holderName}</h4>
                    <p className="text-xs text-zinc-400">{pass.holderEmail}</p>
                    <code className="text-[10px] text-zinc-500">{pass.token}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pass.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      }`}
                    >
                      {pass.status}
                    </span>
                    <Link
                      href={`/p/${pass.token}`}
                      target="_blank"
                      className="text-xs text-pink-400 hover:underline font-medium"
                    >
                      View QR
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Scan Audit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Recent Gate Activity
            </h2>
            <Link
              href={`/admin/events/${event.id}/check-ins`}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View Full Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            {event.checkIns.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No scan logs yet</p>
            ) : (
              event.checkIns.slice(0, 6).map((ci: any) => (
                <div
                  key={ci.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ci.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {ci.status}
                      </span>
                      <span className="text-xs font-medium text-white">
                        {ci.pass?.holderName || "Unknown Token"}
                      </span>
                    </div>
                    {ci.rejectionReason && (
                      <p className="text-[11px] text-rose-400">{ci.rejectionReason}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(ci.scannedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
