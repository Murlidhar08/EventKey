"use client";

import { useEffect, useRef, useState } from "react";
import { renderQRCode, downloadQRCode, type Options } from "@/lib/qr-code";
import { Download, Loader2 } from "lucide-react";

interface QRCodeViewProps {
  data: string;
  width?: number;
  height?: number;
  showDownload?: boolean;
  fileName?: string;
  className?: string;
  overrides?: Partial<Options>;
}

export function QRCodeView({
  data,
  width = 280,
  height = 280,
  showDownload = true,
  fileName = "eventkey-pass",
  className = "",
  overrides = {},
}: QRCodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initQR() {
      if (!containerRef.current || !data) return;
      setLoading(true);
      try {
        await renderQRCode(containerRef.current, data, {
          width,
          height,
          ...overrides,
        });
      } catch (err) {
        console.error("Failed to render QR Code:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initQR();

    return () => {
      mounted = false;
    };
  }, [data, width, height, overrides]);

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      await downloadQRCode(data, fileName, "png", { width: 500, height: 500, ...overrides });
    } catch (err) {
      console.error("Failed to download QR code:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl ${className}`}>
      <div className="relative flex items-center justify-center min-h-[200px] min-w-[200px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60 z-10 rounded-xl">
            <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
          </div>
        )}
        <div ref={containerRef} className="rounded-xl overflow-hidden shadow-sm" />
      </div>

      {showDownload && (
        <button
          onClick={handleDownload}
          disabled={loading || downloading}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 active:scale-95 transition-all rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download QR Pass
        </button>
      )}
    </div>
  );
}
