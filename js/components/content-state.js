const CONTENT_STATE_KINDS = new Set(["loading", "offline", "success", "warning", "error"]);

export function normalizeContentStateKind(kind) {
  if (!CONTENT_STATE_KINDS.has(kind)) throw new RangeError(`Content state kind not supported: ${kind}`);
  return kind;
}

export function createContentStatus({ message, kind = "loading", urgent = false } = {}) {
  if (!message) throw new TypeError("Content status requires a message.");
  const status = document.createElement("p");
  status.className = `ns-content-status ns-content-status--${normalizeContentStateKind(kind)}`;
  status.textContent = message;
  status.setAttribute("role", urgent ? "alert" : "status");
  status.setAttribute("aria-live", urgent ? "assertive" : "polite");
  if (kind === "loading") status.setAttribute("aria-busy", "true");
  return status;
}
