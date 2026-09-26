import { normalizeSearchText } from "./product-service.js";

export const SCAN_ACTIONS = Object.freeze({ OPEN: "open", ENTRY: "entry", OUTPUT: "output" });
export class ScannerUnavailableError extends Error {}
export function normalizeScanCode(value) {
  const raw = String(value ?? "").trim().replace(/^NXL\|/iu, "");
  return normalizeSearchText(raw).replace(/\s+/gu, "").toUpperCase();
}

export class NexScanService {
  constructor({ productService, navigatorRef = globalThis.navigator, BarcodeDetectorClass = globalThis.BarcodeDetector, timer = globalThis } = {}) {
    if (!productService) throw new TypeError("NexScanService requires ProductService.");
    this.productService = productService; this.navigator = navigatorRef; this.BarcodeDetectorClass = BarcodeDetectorClass; this.timer = timer; this.stream = null; this.timerId = null;
  }
  get cameraSupported() { return Boolean(this.navigator?.mediaDevices?.getUserMedia); }
  get barcodeSupported() { return typeof this.BarcodeDetectorClass === "function"; }
  async findProduct(workspaceId, code) {
    const normalized = normalizeScanCode(code);
    if (!workspaceId || !normalized) return null;
    const products = await this.productService.search(workspaceId, { query: normalized, archived: "active" });
    return products.find((product) => normalizeScanCode(product.nexCode) === normalized)
      ?? (products.length === 1 ? products[0] : null);
  }
  async start(video, onCode) {
    if (!this.cameraSupported) throw new ScannerUnavailableError("Camera is not supported.");
    this.stop();
    this.stream = await this.navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    video.srcObject = this.stream; await video.play?.();
    if (!this.barcodeSupported) return this.stream;
    const detector = new this.BarcodeDetectorClass({ formats: ["code_128", "code_39", "ean_13", "ean_8", "qr_code"] });
    const detect = async () => {
      if (!this.stream) return;
      try { const [result] = await detector.detect(video); if (result?.rawValue) { onCode(result.rawValue); this.stop(); return; } } catch { /* Manual fallback remains available. */ }
      this.timerId = this.timer.setTimeout(detect, 300);
    };
    detect(); return this.stream;
  }
  stop() { if (this.timerId) this.timer.clearTimeout(this.timerId); this.timerId = null; this.stream?.getTracks?.().forEach((track) => track.stop()); this.stream = null; }
}
