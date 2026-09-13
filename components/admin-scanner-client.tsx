"use client";

import { useState } from "react";
import { validatePassTokenAction, type ScanResult } from "@/actions/event-actions";
import { Scan, ShieldCheck, ShieldX, Loader2, Sparkles, AlertCircle, RefreshCw, CheckCircle2, History } from "lucide-react";
import { toast } from "sonner";

interface AdminScannerClientProps {
  event: any;
}

export function AdminScannerClient({ event }: AdminScannerClientProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>(event.checkIns || []);

  const handleScanToken = async (e?: React.FormEvent, manualToken?: string) => {
    if (e) e.preventDefault();
    const tokenToValidate = (manualToken || tokenInput).trim();

    if (!tokenToValidate) {
      toast.error("Please enter or scan a pass token.");
      return;
    }

    setLoading(true);
    try {
      const res = await validatePassTokenAction(event.id, tokenToValidate, "Gate Controller #1");
      setLastResult(res);

      if (res.status === "APPROVED") {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }

      setRecentScans([
        {
          id: res.checkIn?.id || String(Date.now()),
          status: res.status,
          scannedToken: tokenToValidate,
          rejectionReason: res.rejectionReason,
          scannedAt: new Date(),
          pass: res.pass ? { holderName: res.pass.holderName, holderEmail: res.pass.holderEmail } : null,
        },
        ...recentScans,
      ]);

      setTokenInput("");
    } catch (err: any) {
      toast.error(err?.message || "Scan validation error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold mb-2">
            <Scan className="w-3.5 h-3.5" /> Atomic Gate Access Controller
          </div>
          <h1 className="text-2xl font-black text-white">{event.title} Gate Scanner</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Scan attendee QR code passes or manually enter tokens for instant single-entry validation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Terminal Column */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scan className="w-5 h-5 text-pink-500" /> Token Scanner Input
              </h2>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Scanner Ready
              </span>
            </div>

            <form onSubmit={(e) => handleScanToken(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Scan QR Code / Enter Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Scan pass or enter token (e.g. ek_...)"
                    autoFocus
                    className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !tokenInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-600/20"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Validate
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Demo Token Buttons */}
            {event.passes && event.passes.length > 0 && (
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <span className="text-xs font-semibold text-zinc-400">Quick Test Tokens from Event:</span>
                <div className="flex flex-wrap gap-2">
                  {event.passes.slice(0, 3).map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setTokenInput(p.token);
                        handleScanToken(undefined, p.token);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-pink-500/50 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <code className="text-purple-400">{p.token.slice(0, 10)}...</code>
                      <span className="text-zinc-500">({p.holderName.split(" ")[0]})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Validation Status Visual Display */}
          {lastResult && (
            <div
              className={`p-8 rounded-3xl border shadow-2xl transition-all duration-300 ${
                lastResult.status === "APPROVED"
                  ? "bg-emerald-950/40 border-emerald-500/60 shadow-emerald-500/10"
                  : "bg-rose-950/40 border-rose-500/60 shadow-rose-500/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      lastResult.status === "APPROVED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    }`}
                  >
                    {lastResult.status === "APPROVED" ? (
                      <ShieldCheck className="w-8 h-8 animate-bounce" />
                    ) : (
                      <ShieldX className="w-8 h-8 animate-pulse" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        lastResult.status === "APPROVED"
                          ? "bg-emerald-500 text-black font-bold"
                          : "bg-rose-500 text-white font-bold"
                      }`}
                    >
                      {lastResult.status}
                    </span>
                    <h3 className="text-xl font-bold text-white pt-1">{lastResult.message}</h3>
                    {lastResult.rejectionReason && (
                      <p className="text-xs text-rose-300 font-medium">Reason: {lastResult.rejectionReason}</p>
                    )}
                  </div>
                </div>
              </div>

              {lastResult.pass && (
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 font-medium">Attendee Name</span>
                    <p className="text-sm font-bold text-white">{lastResult.pass.holderName}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-medium">Attendee Email</span>
                    <p className="text-sm font-bold text-white">{lastResult.pass.holderEmail}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 font-medium">Token</span>
                    <p className="font-mono text-xs text-purple-300">{lastResult.pass.token}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scan History Feed Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" /> Real-time Gate Scan Feed
            </h2>
            <span className="text-xs text-zinc-400 font-medium">{recentScans.length} Scans Logged</span>
          </div>

          <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3 max-h-[600px] overflow-y-auto">
            {recentScans.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-12">No scans executed yet</p>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    scan.status === "APPROVED"
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : "bg-rose-950/20 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            scan.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {scan.status}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {scan.pass?.holderName || "Unknown Attendee"}
                        </span>
                      </div>
                      {scan.rejectionReason && (
                        <p className="text-xs text-rose-400 font-medium">{scan.rejectionReason}</p>
                      )}
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Token: <code className="text-zinc-300">{scan.scannedToken}</code>
                      </p>
                    </div>

                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                      {new Date(scan.scannedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
