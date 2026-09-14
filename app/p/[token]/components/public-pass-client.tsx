"use client";

import { useRef, useState } from "react";
import { QRCodeView } from "@/components/qr-code-view";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  Download,
  Loader2,
  Sparkles,
  Ticket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import Link from "next/link";

interface PublicPassClientProps {
  pass: any;
  event: any;
  eventDateFormatted: string;
}

type StatusTheme = {
  badgeClass: string;
  badgeLabel: string;
  glowClass: string;
  borderClass: string;
  headerGradient: string;
  accentText: string;
  footerText: string;
  IconComponent: any;
};

const STATUS_THEMES: Record<string, StatusTheme> = {
  ACTIVE: {
    badgeClass: "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 font-black",
    badgeLabel: "✓ ACTIVE PASS",
    glowClass: "bg-emerald-500/20",
    borderClass: "border-emerald-500/40 shadow-emerald-950/40",
    headerGradient: "from-emerald-950/80 via-emerald-900/30 to-zinc-900",
    accentText: "text-emerald-400",
    footerText: "text-emerald-400",
    IconComponent: CheckCircle2,
  },
  USED: {
    badgeClass: "bg-purple-500 text-white shadow-lg shadow-purple-500/25 font-black",
    badgeLabel: "✓ USED PASS",
    glowClass: "bg-purple-500/20",
    borderClass: "border-purple-500/40 shadow-purple-950/40",
    headerGradient: "from-purple-950/80 via-purple-900/30 to-zinc-900",
    accentText: "text-purple-400",
    footerText: "text-purple-400",
    IconComponent: Clock,
  },
  EXPIRED: {
    badgeClass: "bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black",
    badgeLabel: "⚠ EXPIRED PASS",
    glowClass: "bg-amber-500/20",
    borderClass: "border-amber-500/40 shadow-amber-950/40",
    headerGradient: "from-amber-950/80 via-amber-900/30 to-zinc-900",
    accentText: "text-amber-400",
    footerText: "text-amber-400",
    IconComponent: AlertTriangle,
  },
  CANCELLED: {
    badgeClass: "bg-rose-600 text-white shadow-lg shadow-rose-600/25 font-black",
    badgeLabel: "✕ CANCELLED PASS",
    glowClass: "bg-rose-600/20",
    borderClass: "border-rose-500/40 shadow-rose-950/40",
    headerGradient: "from-rose-950/80 via-rose-900/30 to-zinc-900",
    accentText: "text-rose-400",
    footerText: "text-rose-400",
    IconComponent: XCircle,
  },
};

export function PublicPassClient({ pass, event, eventDateFormatted }: PublicPassClientProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const statusKey = (pass?.status || "ACTIVE").toUpperCase();
  const theme = STATUS_THEMES[statusKey] || STATUS_THEMES.ACTIVE;
  const StatusIcon = theme.IconComponent;

  const handleDownloadFullPass = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Wait a frame for any canvas render stability
      await new Promise((r) => setTimeout(r, 150));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#09090b",
      });

      const sanitizeName = (pass.holderName || "pass").replace(/[^a-zA-Z0-9_-]/g, "_");
      const link = document.createElement("a");
      link.download = `EventKey_Pass_${sanitizeName}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Pass image downloaded successfully!");
    } catch (err: any) {
      console.error("Failed to capture pass image:", err);
      toast.error(err?.message || "Failed to download pass as image.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-pink-500">
      {/* Dynamic Status Background Glow */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <div className={`w-[600px] h-[600px] ${theme.glowClass} rounded-full blur-[150px] transition-all duration-700`} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-5">
        {/* Top Control Bar with Download Action */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> EventKey Verification
          </div>

          <button
            onClick={handleDownloadFullPass}
            disabled={downloading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-lg shadow-pink-600/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download Pass
              </>
            )}
          </button>
        </div>

        {/* Capturable Pass Card */}
        <div
          ref={cardRef}
          className={`rounded-3xl bg-zinc-900/95 border ${theme.borderClass} shadow-2xl overflow-hidden backdrop-blur-2xl transition-all duration-300`}
        >
          {/* Top Ticket Header */}
          <div className={`p-6 bg-gradient-to-br ${theme.headerGradient} border-b border-zinc-800/80 space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full ${theme.badgeClass} flex items-center gap-1.5`}>
                <StatusIcon className="w-3 h-3" /> {theme.badgeLabel}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800">
                {pass.token}
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{event?.title || "Special Event"}</h2>
              {event?.location && (
                <p className="text-xs text-zinc-300 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" /> {event.location}
                </p>
              )}
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {eventDateFormatted}
              </p>
            </div>
          </div>

          {/* QR Code Center Section */}
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-5 text-center bg-zinc-900/50">
            <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xl">
              <QRCodeView
                data={pass.token}
                width={220}
                height={220}
                fileName={`pass-${pass.holderName}`}
                showDownload={false}
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
                Official Ticket Holder
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">{pass.holderName}</h3>
              <p className="text-xs text-zinc-400 font-medium">{pass.holderEmail}</p>
            </div>
          </div>

          {/* Ticket Footer Security Info */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 text-center text-xs text-zinc-400 space-y-1">
            <p className={`flex items-center justify-center gap-1.5 font-bold ${theme.footerText}`}>
              <ShieldCheck className="w-4 h-4" /> Atomic Single-Entry Guaranteed
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              One Scan. One Entry. • EventKey Security Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
