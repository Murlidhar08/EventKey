import { AppHeader } from "@/components/app-header";
import { getEventsAction } from "@/actions/event-actions";
import { CreateEventDialog } from "@/components/create-event-dialog";
import Link from "next/link";
import { Calendar, Ticket, Scan, ArrowRight, MapPin, Users, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const { events } = await getEventsAction();

  return (
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto w-full">
      <AppHeader title="Events Management" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Events Registry</h1>
          <p className="text-sm text-zinc-400">
            Create and manage events, configure ticket issuance, and launch access controllers.
          </p>
        </div>
        <CreateEventDialog />
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 space-y-4">
          <Calendar className="w-12 h-12 mx-auto text-zinc-600" />
          <h3 className="text-lg font-bold text-white">No Events Created Yet</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Click &quot;Create New Event&quot; above to set up your first event and start issuing QR pass tokens.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt: any) => {
            const startDateFormatted = new Date(evt.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={evt.id}
                className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-pink-500/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[11px] font-semibold">
                      <Calendar className="w-3 h-3" /> {startDateFormatted}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      Cap: <strong className="text-white">{evt.capacity}</strong>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">
                    {evt.title}
                  </h3>

                  {evt.location && (
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> {evt.location}
                    </p>
                  )}

                  {evt.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5 text-purple-400" /> {evt._count.passes} Passes Issued
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> {evt._count.checkIns} Scans
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Link
                      href={`/admin/events/${evt.id}`}
                      className="px-2 py-2 rounded-xl text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-center flex items-center justify-center gap-1"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/admin/events/${evt.id}/passes`}
                      className="px-2 py-2 rounded-xl text-[11px] font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-center flex items-center justify-center gap-1"
                    >
                      <Ticket className="w-3 h-3" /> Passes
                    </Link>
                    <Link
                      href={`/admin/events/${evt.id}/scanner`}
                      className="px-2 py-2 rounded-xl text-[11px] font-semibold bg-pink-600 hover:bg-pink-500 text-white text-center flex items-center justify-center gap-1 shadow-md shadow-pink-600/20"
                    >
                      <Scan className="w-3 h-3" /> Scan
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
