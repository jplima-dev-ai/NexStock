export function getPwaUpdateFacts({ appVersion = "unknown", updateAvailable = false, criticalOperation = false, installAvailable = false } = {}) {
  return Object.freeze({
    version: String(appVersion), cache: "serviceWorkerCache", installation: installAvailable ? "available" : "browserControlled",
    update: updateAvailable ? (criticalOperation ? "deferred" : "available") : "current",
  });
}

export class PwaService {
  constructor({ navigatorObject = globalThis.navigator, windowObject = globalThis.window, onUpdateAvailable = () => {}, onConnectionChange = () => {}, onInstallAvailable = () => {} } = {}) {
    this.navigator = navigatorObject;
    this.window = windowObject;
    this.onUpdateAvailable = onUpdateAvailable;
    this.onConnectionChange = onConnectionChange;
    this.onInstallAvailable = onInstallAvailable;
    this.registration = null;
    this.installPrompt = null;
    this.updateRequested = false;
  }

  async start() {
    this.onConnectionChange(this.navigator.onLine === false ? "offline" : "online");
    this.window?.addEventListener("online", () => this.onConnectionChange("online"));
    this.window?.addEventListener("offline", () => this.onConnectionChange("offline"));
    this.window?.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); this.installPrompt = event; this.onInstallAvailable(); });
    if (!this.navigator.serviceWorker) return null;
    this.registration = await this.navigator.serviceWorker.register("./service-worker.js");
    if (this.registration.waiting) this.onUpdateAvailable(this.registration);
    this.registration.addEventListener("updatefound", () => {
      const worker = this.registration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && this.navigator.serviceWorker.controller) this.onUpdateAvailable(this.registration);
      });
    });
    this.navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (this.updateRequested) this.window.location.reload();
    });
    return this.registration;
  }

  applyUpdate() {
    if (!this.registration?.waiting) return false;
    this.updateRequested = true;
    this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    return true;
  }

  async requestInstall() {
    if (!this.installPrompt) return false;
    await this.installPrompt.prompt();
    this.installPrompt = null;
    return true;
  }

  getUpdateFacts(options) { return getPwaUpdateFacts({ ...options, installAvailable: Boolean(this.installPrompt) }); }
}
