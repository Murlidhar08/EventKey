import defaultOptionsConfig from "@/public/options.json";
import type QRCodeStyling from "qr-code-styling";
import type { Options } from "qr-code-styling";

export type { Options };

export interface QRCodeCustomConfig {
  data: string;
  width?: number;
  height?: number;
  image?: string;
  type?: "canvas" | "svg";
  margin?: number;
  dotsColor?: string;
  backgroundColor?: string;
  customOptions?: Partial<Options>;
}

/**
 * Merges the base options from public/options.json with optional user/data overrides.
 */
export function getQROptions(data: string, overrides: Partial<Options> = {}): Options {
  const baseOptions: Options = {
    width: overrides.width || defaultOptionsConfig.width || 300,
    height: overrides.height || defaultOptionsConfig.height || 300,
    type: overrides.type || (defaultOptionsConfig.type as any) || "canvas",
    shape: overrides.shape || (defaultOptionsConfig.shape as any) || "square",
    data: data,
    margin: overrides.margin ?? defaultOptionsConfig.margin ?? 0,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: (defaultOptionsConfig.qrOptions?.errorCorrectionLevel as any) || "Q",
      ...overrides.qrOptions,
    },
    imageOptions: {
      hideBackgroundDots: defaultOptionsConfig.imageOptions?.hideBackgroundDots ?? true,
      imageSize: defaultOptionsConfig.imageOptions?.imageSize ?? 0.4,
      margin: defaultOptionsConfig.imageOptions?.margin ?? 0,
      ...overrides.imageOptions,
    },
    dotsOptions: {
      type: (defaultOptionsConfig.dotsOptions?.type as any) || "square",
      color: defaultOptionsConfig.dotsOptions?.color || "#f00094",
      roundSize: defaultOptionsConfig.dotsOptions?.roundSize ?? true,
      gradient: defaultOptionsConfig.dotsOptions?.gradient as any,
      ...overrides.dotsOptions,
    },
    backgroundOptions: {
      round: defaultOptionsConfig.backgroundOptions?.round ?? 0,
      color: defaultOptionsConfig.backgroundOptions?.color || "#ffffff",
      ...overrides.backgroundOptions,
    },
    cornersSquareOptions: {
      type: (defaultOptionsConfig.cornersSquareOptions?.type as any) || undefined,
      color: defaultOptionsConfig.cornersSquareOptions?.color || "#000000",
      ...overrides.cornersSquareOptions,
    },
    cornersDotOptions: {
      type: (defaultOptionsConfig.cornersDotOptions?.type as any) || undefined,
      color: defaultOptionsConfig.cornersDotOptions?.color || "#000000",
      ...overrides.cornersDotOptions,
    },
  };

  return {
    ...baseOptions,
    ...overrides,
    data,
  };
}

/**
 * Creates a new QRCodeStyling instance on client side.
 */
export async function createQRCodeInstance(data: string, overrides: Partial<Options> = {}): Promise<QRCodeStyling | null> {
  if (typeof window === "undefined") return null;
  const QRCodeStylingLib = (await import("qr-code-styling")).default;
  const options = getQROptions(data, overrides);
  return new QRCodeStylingLib(options);
}

/**
 * Renders QR Code into a DOM container element.
 */
export async function renderQRCode(container: HTMLElement, data: string, overrides: Partial<Options> = {}): Promise<QRCodeStyling | null> {
  if (typeof window === "undefined" || !container) return null;
  container.innerHTML = "";
  const qrCode = await createQRCodeInstance(data, overrides);
  if (qrCode) {
    qrCode.append(container);
  }
  return qrCode;
}

/**
 * Utility to download generated QR Code.
 */
export async function downloadQRCode(data: string, fileName: string = "eventkey-pass", extension: "png" | "svg" | "jpeg" | "webp" = "png", overrides: Partial<Options> = {}): Promise<void> {
  const qrCode = await createQRCodeInstance(data, overrides);
  if (qrCode) {
    await qrCode.download({ name: fileName, extension });
  }
}
