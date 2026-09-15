"use client";

import { useState } from "react";
import { createPassAction, generateBulkPassesAction } from "@/actions/event-actions";
import { QRCodeView } from "@/components/qr-code-view";
import Link from "next/link";
import { Ticket, Plus, Sparkles, Loader2, QrCode, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";

interface PassManagementClientProps {
  event: any;
}

export function PassManagementClient({ event }: PassManagementClientProps) {
  const [passes, setPasses] = useState<any[]>(event.passes || []);
  const [holderName, setHolderName] = useState("");
  const [holderEmail, setHolderEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedPass, setSelectedPass] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const handleIssuePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName || !holderEmail) {
      toast.error("Please enter holder name and email.");
      return;
    }

    setLoading(true);
    try {
      const res = await createPassAction({
        eventId: event.id,
        holderName,
        holderEmail,
      });

      if (res.success && res.pass) {
        toast.success(`Pass issued for ${res.pass.holderName}!`);
        setPasses([res.pass, ...passes]);
        setSelectedPass(res.pass);
        setHolderName("");
        setHolderEmail("");
      } else {
        toast.error(res.error || "Failed to issue pass.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    setBulkLoading(true);
    try {
      const res = await generateBulkPassesAction(event.id, 5);
      if (res.success) {
        toast.success(`Successfully generated ${res.count} test passes!`);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to generate bulk passes.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Bulk generation error.");
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredPasses = passes.filter(
    (p) =>
      p.holderName.toLowerCase().includes(search.toLowerCase()) ||
      p.holderEmail.toLowerCase().includes(search.toLowerCase()) ||
      p.token.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Ticket className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Pass & Ticket Generator
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Generate single-use QR passes with cryptographically random tokens for <strong className="text-foreground">{event.title}</strong>.
          </p>
        </div>

        <button
          onClick={handleBulkGenerate}
          disabled={bulkLoading}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-500" />}
          Generate 5 Test Passes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pass Creation Form Column */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-pink-500" /> Issue New Attendee Pass
            </h2>

            <form onSubmit={handleIssuePass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Attendee Name *</label>
                <input
                  type="text"
                  required
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Attendee Email *</label>
                <input
                  type="email"
                  required
                  value={holderEmail}
                  onChange={(e) => setHolderEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-pink-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                Generate QR Pass
              </button>
            </form>
          </div>

          {/* Selected Pass Preview Box */}
          {selectedPass && (
            <div className="p-6 rounded-3xl bg-card border border-purple-500/40 space-y-4 text-center animate-in fade-in duration-300 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Latest Generated Pass
              </span>
              <h3 className="text-lg font-bold text-foreground">{selectedPass.holderName}</h3>
              <p className="text-xs text-muted-foreground">{selectedPass.holderEmail}</p>

              <div className="flex justify-center my-2">
                <QRCodeView
                  data={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${selectedPass.token}`}
                  width={220}
                  height={220}
                  fileName={`pass-${selectedPass.holderName}`}
                />
              </div>

              <div className="pt-2">
                <Link
                  href={`/p/${selectedPass.token}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                >
                  Open Public Pass URL <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Issued Passes List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Issued Passes ({passes.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search attendee or token..."
                className="w-full pl-9 pr-4 py-2 sm:py-1.5 bg-background border border-input rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-3xl bg-card border border-border space-y-3 shadow-xs">
            {filteredPasses.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10">No passes found</p>
            ) : (
              filteredPasses.map((pass) => (
                <div
                  key={pass.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground text-sm truncate">{pass.holderName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pass.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {pass.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{pass.holderEmail}</p>
                    <p className="text-[11px] text-muted-foreground font-mono break-all">
                      Token: <code className="text-purple-600 dark:text-purple-300 font-semibold">{pass.token}</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedPass(pass)}
                      className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-1.5 cursor-pointer border border-border"
                    >
                      <QrCode className="w-3.5 h-3.5 text-pink-500" /> Preview QR
                    </button>
                    <Link
                      href={`/p/${pass.token}`}
                      target="_blank"
                      className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1.5"
                    >
                      Public Pass <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
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
