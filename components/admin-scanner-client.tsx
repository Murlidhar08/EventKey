"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { validatePassTokenAction, type ScanResult } from "@/actions/event-actions";
import { ShieldCheck, ShieldX, Camera, RefreshCw, AlertCircle, Loader2, Keyboard } from "lucide-react";
import { toast } from "sonner";

interface AdminScannerClientProps {
  event: any;
}

export function AdminScannerClient({ event }: AdminScannerClientProps) {
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  const html5QrcodeRef = useRef<any>(null);
  const processingRef = useRef(false);
  const lastScannedTokenRef = useRef<string | null>(null);

  // Extract pass token from URL or text string
  const extractToken = (rawText: string): string => {
    const trimmed = rawText.trim();
    // Check if URL like http://.../p/ek_123456
    const urlMatch = trimmed.match(/\/p\/(ek_[a-zA-Z0-9]+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    // Check direct token match
    const tokenMatch = trimmed.match(/ek_[a-zA-Z0-9]+/);
    if (tokenMatch) {
      return tokenMatch[0];
    }
    return trimmed;
  };

  const handleValidateToken = useCallback(
    async (rawText: string) => {
      const token = extractToken(rawText);
      if (!token || processingRef.current) return;

      processingRef.current = true;
      lastScannedTokenRef.current = token;
      setScannedToken(token);
      setLoading(true);

      // Trigger device haptic feedback if supported
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([80, 40, 80]);
        } catch (e) {
          // ignore
        }
      }

      try {
        const res = await validatePassTokenAction(event.id, token, "Gate Camera Scanner");
        setLastResult(res);

        if (res.status === "APPROVED") {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      } catch (err: any) {
        toast.error(err?.message || "Validation error");
      } finally {
        setLoading(false);
        // Allow rescanning after delay
        setTimeout(() => {
          processingRef.current = false;
        }, 2500);
      }
    },
    [event.id]
  );

  // Start Camera Stream using html5-qrcode
  useEffect(() => {
    if (manualInput) return;

    let isMounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (html5QrcodeRef.current) {
          try {
            await html5QrcodeRef.current.stop();
          } catch (e) {
            // ignore
          }
        }

        const html5Qrcode = new Html5Qrcode("qr-reader");
        html5QrcodeRef.current = html5Qrcode;

        const config = {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        await html5Qrcode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isMounted) {
              handleValidateToken(decodedText);
            }
          },
          () => {
            // silent frame scan callback
          }
        );

        if (isMounted) {
          setCameraActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        console.error("Camera scanner error:", err);
        if (isMounted) {
          setCameraActive(false);
          setCameraError(err?.message || "Could not access camera. Please verify permissions.");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
    };
  }, [handleValidateToken, manualInput]);

  const resetScanner = () => {
    setLastResult(null);
    setScannedToken(null);
    processingRef.current = false;
    lastScannedTokenRef.current = null;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      handleValidateToken(tokenInput);
      setTokenInput("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold">
            <Camera className="w-3.5 h-3.5 animate-pulse" /> Live Camera Scanner
          </span>
        </div>

        <button
          onClick={() => {
            setManualInput(!manualInput);
            resetScanner();
          }}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Keyboard className="w-3.5 h-3.5" />
          {manualInput ? "Switch to Camera" : "Manual Token Entry"}
        </button>
      </div>

      {/* Main Camera View Container */}
      {!manualInput ? (
        <div className="relative rounded-3xl overflow-hidden bg-black border border-border shadow-2xl aspect-square max-w-md mx-auto flex flex-col items-center justify-center">
          {/* HTML5 Qr Code Video Viewfinder */}
          <div id="qr-reader" className="w-full h-full object-cover" />

          {/* Scanner Overlay Frame Animation */}
          {cameraActive && !lastResult && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Target Bounding Box */}
              <div className="w-64 h-64 border-2 border-pink-500/80 rounded-3xl relative shadow-[0_0_50px_rgba(236,72,153,0.3)]">
                {/* Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-pink-500 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-pink-500 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-pink-500 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-pink-500 rounded-br-xl" />

                {/* Laser Scanning Line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_15px_#ec4899] animate-bounce mt-32" />
              </div>
              <span className="text-[11px] font-mono text-white/80 mt-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                Align QR Code within frame
              </span>
            </div>
          )}

          {/* Camera Loading / Permissions Error Screen */}
          {(!cameraActive || cameraError) && (
            <div className="absolute inset-0 bg-card/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
              {cameraError ? (
                <>
                  <AlertCircle className="w-12 h-12 text-rose-500" />
                  <h3 className="text-base font-bold text-foreground">Camera Access Required</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">{cameraError}</p>
                  <button
                    onClick={() => setManualInput(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Use Manual Token Entry
                  </button>
                </>
              ) : (
                <>
                  <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
                  <p className="text-xs font-medium text-muted-foreground">Initializing Camera Stream...</p>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Manual Token Entry Fallback */
        <div className="p-8 rounded-3xl bg-card border border-border shadow-xl space-y-4 max-w-md mx-auto">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-pink-500" /> Enter Pass Token Manually
          </h3>
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. ek_1a2b3c4d5e6f"
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
            <button
              type="submit"
              disabled={loading || !tokenInput.trim()}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Validate Pass
            </button>
          </form>
        </div>
      )}

      {/* Validation Result Display Card */}
      {lastResult && (
        <div
          className={`p-6 rounded-3xl border shadow-2xl transition-all duration-300 animate-in fade-in zoom-in ${
            lastResult.status === "APPROVED"
              ? "bg-emerald-500/10 dark:bg-emerald-950/50 border-emerald-500/60 shadow-emerald-500/20"
              : "bg-rose-500/10 dark:bg-rose-950/50 border-rose-500/60 shadow-rose-500/20"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  lastResult.status === "APPROVED"
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white"
                }`}
              >
                {lastResult.status === "APPROVED" ? (
                  <ShieldCheck className="w-7 h-7" />
                ) : (
                  <ShieldX className="w-7 h-7" />
                )}
              </div>

              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    lastResult.status === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {lastResult.status}
                </span>
                <h3 className="text-lg font-bold text-foreground pt-0.5">{lastResult.message}</h3>
              </div>
            </div>

            <button
              onClick={resetScanner}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-1.5 transition-all cursor-pointer border border-border"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Next Scan
            </button>
          </div>

          {lastResult.pass && (
            <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Attendee Name</span>
                <p className="text-sm font-bold text-foreground">{lastResult.pass.holderName}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Attendee Email</span>
                <p className="text-sm font-bold text-foreground">{lastResult.pass.holderEmail}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground font-medium">Scanned Token</span>
                <p className="font-mono text-xs text-purple-600 dark:text-purple-300 font-semibold">{scannedToken}</p>
              </div>
            </div>
          )}

          {lastResult.rejectionReason && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-2">
              Reason: {lastResult.rejectionReason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
