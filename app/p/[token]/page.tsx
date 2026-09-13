import { getPassByTokenAction } from "@/actions/event-actions";
import { QRCodeView } from "@/components/qr-code-view";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QrCode, Calendar, MapPin, Ticket, ShieldCheck, CheckCircle2, ShieldX, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface PublicPassPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicPassPage({ params }: PublicPassPageProps) {
  const { token } = await params;
  const res = await getPassByTokenAction(token);

  if (!res.success || !res.pass) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <ShieldX className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Invalid Event Pass Token</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          The pass token <code className="text-pink-400 font-mono">{token}</code> could not be found or has been revoked.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl border border-zinc-800"
        >
          Return to EventKey Home
        </Link>
      </div>
    );
  }

  const { pass } = res;
  const event = pass.event;

  const eventDateFormatted = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Event Date";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-pink-500">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* EventKey Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Official EventKey Pass
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">One Scan. One Entry.</h1>
        </div>

        {/* Ticket Card */}
        <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Top Ticket Header */}
          <div className="p-6 bg-gradient-to-r from-pink-950/60 via-purple-950/40 to-zinc-900 border-b border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                  pass.status === "ACTIVE"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                    : "bg-purple-500 text-white"
                }`}
              >
                {pass.status === "ACTIVE" ? "✓ ACTIVE PASS" : pass.status}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {pass.token}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white pt-2">{event?.title || "Special Event"}</h2>

            {event?.location && (
              <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" /> {event.location}
              </p>
            )}

            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {eventDateFormatted}
            </p>
          </div>

          {/* QR Code Center Section */}
          <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xl">
              <QRCodeView
                data={pass.token}
                width={250}
                height={250}
                fileName={`pass-${pass.holderName}`}
                showDownload={true}
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest block">
                Ticket Holder
              </span>
              <h3 className="text-xl font-extrabold text-white">{pass.holderName}</h3>
              <p className="text-xs text-zinc-400">{pass.holderEmail}</p>
            </div>
          </div>

          {/* Ticket Footer Security Info */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center text-xs text-zinc-400 space-y-1">
            <p className="flex items-center justify-center gap-1 font-medium text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Atomic Single-Entry Guaranteed
            </p>
            <p className="text-[10px] text-zinc-400">
              Present this QR code at the event gate. Once scanned, pass status transforms to <code className="text-purple-400 font-bold">USED</code>.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
            &larr; Back to EventKey Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
