import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { prisma } from "@/lib/prisma/prisma";
import { Calendar, Ticket, CheckCircle2, ShieldX, Scan, Plus, ArrowRight, Activity, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const totalEvents = await prisma.event.count();
  const totalPasses = await prisma.pass.count();
  const activePasses = await prisma.pass.count({ where: { status: "ACTIVE" } });
  const usedPasses = await prisma.pass.count({ where: { status: "USED" } });
  const approvedCheckIns = await prisma.checkIn.count({ where: { status: "APPROVED" } });
  const deniedCheckIns = await prisma.checkIn.count({ where: { status: "DENIED" } });

  const recentEvents = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      _count: {
        select: { passes: true, checkIns: true },
      },
    },
  });

  const recentCheckIns = await prisma.checkIn.findMany({
    orderBy: { scannedAt: "desc" },
    take: 6,
    include: {
      event: true,
      pass: true,
    },
  });

  return (
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto w-full">
      <AppHeader title="EventKey Admin Overview" />

      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-pink-950/40 p-8 border border-zinc-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5" /> Live Gate System Operational
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">EventKey Control Center</h1>
            <p className="mt-1 text-sm text-zinc-400">
              One Scan. One Entry. Manage events, issue tickets, launch gate scanners, and monitor check-ins.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/events"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-pink-600 hover:bg-pink-500 text-white transition-all shadow-lg shadow-pink-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Manage Events
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Events</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{totalEvents}</p>
          <span className="text-[11px] text-zinc-500 font-medium">Active & Upcoming</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Passes</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{totalPasses}</p>
          <div className="flex items-center gap-2 mt-1 text-[11px]">
            <span className="text-emerald-400">{activePasses} Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">{usedPasses} Used</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Approved Entries</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-400">{approvedCheckIns}</p>
          <span className="text-[11px] text-zinc-500 font-medium">Atomic Gate Validations</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Rejections</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldX className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-400">{deniedCheckIns}</p>
          <span className="text-[11px] text-zinc-500 font-medium">Double-scans / Invalid</span>
        </div>
      </div>

      {/* Main Grid: Recent Events + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" /> Active Events
            </h2>
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-zinc-400">
              <Calendar className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
              <p className="font-semibold text-sm">No events created yet</p>
              <p className="text-xs text-zinc-500 mt-1">Create your first event to start issuing pass tokens.</p>
              <Link
                href="/admin/events"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-pink-600 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" /> Create Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">{evt.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">{evt.location || "No location set"}</p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                      <span>Passes: <strong className="text-white">{evt._count.passes}</strong></span>
                      <span>•</span>
                      <span>Check-ins: <strong className="text-white">{evt._count.checkIns}</strong></span>
                      <span>•</span>
                      <span>Capacity: <strong className="text-white">{evt.capacity}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/events/${evt.id}/passes`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5 text-purple-400" /> Passes
                    </Link>
                    <Link
                      href={`/admin/events/${evt.id}/scanner`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 flex items-center gap-1.5"
                    >
                      <Scan className="w-3.5 h-3.5" /> Gate Scanner
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Gate Scans Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Recent Gate Scans
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            {recentCheckIns.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No scan logs yet</p>
            ) : (
              recentCheckIns.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/60 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs font-medium text-white truncate max-w-[120px]">
                        {item.pass?.holderName || "Unknown"}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Token: <code className="text-zinc-400">{item.scannedToken.slice(0, 12)}...</code>
                    </p>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(item.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
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
