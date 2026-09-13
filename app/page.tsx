import Link from "next/link";
import { ArrowRight, QrCode, ShieldCheck, Zap, Ticket, CheckCircle2, Scan } from "lucide-react";
import { PassLookupForm } from "@/components/pass-lookup-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-pink-500 selection:text-white flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-pink-400 bg-clip-text text-transparent">
                EventKey
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                One Scan. One Entry.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/events"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-all flex items-center gap-2"
            >
              Events Portal
            </Link>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-600/25 flex items-center gap-2 active:scale-95"
            >
              Admin Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Zap className="w-3.5 h-3.5" /> High-Performance Atomic Pass Engine
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-[1.1] text-white">
          One Scan. <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">One Entry.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl font-normal leading-relaxed">
          The ultimate single-use event pass validation platform. Powered by cryptographically secure QR tokens, real-time gate scanning, and atomic database state guarantees.
        </p>

        {/* Pass Lookup Card */}
        <div className="mt-10 w-full max-w-xl p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2 justify-center">
            <Ticket className="w-4 h-4 text-pink-400" /> Have an Event Pass Token? Check Status
          </h2>
          <PassLookupForm />
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-pink-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Atomic Validation</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Guarantees zero double-scans using instant, transactional state transitions (<code className="text-pink-400">ACTIVE &rarr; USED</code>).
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Styled QR Generator</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Generates custom branded QR code passes with custom dots, gradients, shapes, and logo integration.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gate Scanner & Audit</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Mobile camera scanner with instant audio/visual feedback and full audit logs for approved & denied entries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} EventKey — One Scan. One Entry. All rights reserved.
      </footer>
    </div>
  );
}
