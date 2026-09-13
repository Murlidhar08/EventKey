"use client";

import { useState } from "react";
import { Activity, CheckCircle2, ShieldX, Search, Filter, Calendar, MapPin, Ticket } from "lucide-react";

interface CheckInsClientProps {
  event: any;
  stats: any;
}

export function CheckInsClient({ event, stats }: CheckInsClientProps) {
  const [checkIns] = useState<any[]>(event.checkIns || []);
  const [filter, setFilter] = useState<"ALL" | "APPROVED" | "DENIED">("ALL");
  const [search, setSearch] = useState("");

  const filtered = checkIns.filter((item) => {
    const matchesStatus = filter === "ALL" || item.status === filter;
    const matchesSearch =
      (item.pass?.holderName || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.pass?.holderEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.scannedToken || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.rejectionReason || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" /> Live Gate Check-In Audit Logs
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time entry verification logs and rejection audit records for <strong className="text-white">{event.title}</strong>.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Total Scans Executed</span>
          <p className="mt-2 text-2xl font-bold text-white">{checkIns.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Approved Entries</span>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{stats?.approvedCount || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Denied Rejections</span>
          <p className="mt-2 text-2xl font-bold text-rose-400">{stats?.deniedCount || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400">Approval Rate</span>
          <p className="mt-2 text-2xl font-bold text-purple-400">
            {checkIns.length > 0 ? Math.round(((stats?.approvedCount || 0) / checkIns.length) * 100) : 100}%
          </p>
        </div>
      </div>

      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === "ALL" ? "bg-white text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            All Logs ({checkIns.length})
          </button>
          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === "APPROVED"
                ? "bg-emerald-500 text-black font-bold"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Approved ({stats?.approvedCount || 0})
          </button>
          <button
            onClick={() => setFilter("DENIED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === "DENIED"
                ? "bg-rose-500 text-white font-bold"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Denied ({stats?.deniedCount || 0})
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee, token, or reason..."
            className="pl-9 pr-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Check-ins Table / Cards List */}
      <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        {filtered.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-12">No check-in logs match current criteria</p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.status === "APPROVED"
                  ? "bg-zinc-950/80 border-emerald-500/30 hover:border-emerald-500/50"
                  : "bg-zinc-950/80 border-rose-500/30 hover:border-rose-500/50"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      item.status === "APPROVED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {item.pass?.holderName || "Unregistered Token"}
                  </span>
                  {item.pass?.holderEmail && (
                    <span className="text-xs text-zinc-400 font-medium">({item.pass.holderEmail})</span>
                  )}
                </div>

                {item.rejectionReason && (
                  <p className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                    <ShieldX className="w-3.5 h-3.5 shrink-0" /> {item.rejectionReason}
                  </p>
                )}

                <p className="text-[11px] text-zinc-500 font-mono">
                  Scanned Token: <code className="text-zinc-300">{item.scannedToken}</code>
                </p>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <span className="text-xs font-mono text-zinc-300 block">
                  {new Date(item.scannedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium block">
                  Scanned by: {item.scannedBy || "Gate Scanner"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
