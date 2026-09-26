const SUPPORTED_CURRENCIES = new Set(["BRL", "USD", "EUR"]);
const SUPPORTED_TIMEZONES = new Set(["America/Sao_Paulo", "UTC", "Europe/Madrid"]);
const SUPPORTED_THEMES = new Set(["light", "dark"]);
const SUPPORTED_EXPERIENCE_MODES = new Set(["guided", "compact"]);
const ALLOWED_KEYS = new Set(["name", "currency", "timezone", "theme", "experienceMode"]);

function normalizeName(value) {
  const name = String(value ?? "").trim().replace(/\s+/gu, " ");
  if (name.length < 2 || name.length > 80) throw new RangeError("Workspace name must contain between 2 and 80 characters.");
  return name;
}

export function normalizeSettingsPatch(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new TypeError("Settings patch must be an object.");
  }
  const entries = Object.entries(patch);
  if (!entries.length) throw new TypeError("At least one setting is required.");
  const normalized = {};
  for (const [key, value] of entries) {
    if (!ALLOWED_KEYS.has(key)) throw new RangeError(`Setting cannot be changed here: ${key}`);
    if (key === "name") normalized.name = normalizeName(value);
    if (key === "currency") {
      if (!SUPPORTED_CURRENCIES.has(value)) throw new RangeError("Unsupported currency.");
      normalized.currency = value;
    }
    if (key === "timezone") {
      if (!SUPPORTED_TIMEZONES.has(value)) throw new RangeError("Unsupported time zone.");
      normalized.timezone = value;
    }
    if (key === "theme") {
      if (!SUPPORTED_THEMES.has(value)) throw new RangeError("Unsupported theme.");
      normalized.theme = value;
    }
    if (key === "experienceMode") {
      if (!SUPPORTED_EXPERIENCE_MODES.has(value)) throw new RangeError("Unsupported experience mode.");
      normalized.experienceMode = value;
    }
  }
  return Object.freeze(normalized);
}

export function createSettingsSummaryModel({ workspace, state }) {
  return Object.freeze([
    Object.freeze({ id: "workspace", route: "/settings/general", values: Object.freeze([workspace?.name ?? "notConfigured", workspace?.profileKey ?? "custom"]) }),
    Object.freeze({ id: "appearance", route: "/settings/appearance", values: Object.freeze([workspace?.theme ?? state.theme, workspace?.experienceMode ?? "guided"]) }),
    Object.freeze({ id: "data", route: "/settings/data", values: Object.freeze([state.persistence, state.provider]) }),
    Object.freeze({ id: "security", route: "/settings/security", values: Object.freeze([state.provider, "nexshield"]) }),
    Object.freeze({ id: "pwa", route: "/settings/pwa", values: Object.freeze([state.connection, state.pwa?.updateAvailable ? "updateAvailable" : "current"]) }),
  ]);
}

export class SettingsService {
  constructor({ provider, now = () => new Date().toISOString() }) {
    if (!provider) throw new TypeError("SettingsService requires a DataProvider.");
    this.provider = provider;
    this.now = now;
  }

  async updateWorkspace(workspaceId, patch) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const current = await this.provider.get("workspaces", workspaceId);
    if (!current) throw new RangeError("Workspace not found.");
    const normalized = normalizeSettingsPatch(patch);
    const workspace = { ...current, ...normalized, updatedAt: this.now() };
    await this.provider.put("workspaces", workspace);
    return workspace;
  }
}
