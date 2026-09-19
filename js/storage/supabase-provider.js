import { assertStoreName, DataProvider } from "./data-provider.js";
import { assertSafeUrl } from "../utils/security.js";

export const STORE_TABLES = Object.freeze({
  meta: "meta", workspaces: "workspaces", categories: "categories", suppliers: "suppliers", products: "products",
  productUnits: "product_units", batches: "stock_batches", movements: "stock_movements", auditLogs: "audit_logs",
  productRelations: "product_relations", kits: "kits", kitItems: "kit_items", customFieldDefinitions: "custom_field_definitions",
  settings: "settings", syncQueue: "sync_queue",
});

const KEY_COLUMNS = Object.freeze({ meta: "key" });

export class SupabaseConfigurationError extends Error {
  constructor(message) { super(message); this.name = "SupabaseConfigurationError"; }
}

export class SupabaseRequestError extends Error {
  constructor(message, { status, details } = {}) { super(message); this.name = "SupabaseRequestError"; this.status = status; this.details = details; }
}

function camelToSnake(key) {
  if (key === "order") return "sort_order";
  return key.replace(/[A-Z]/gu, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(key) {
  if (key === "sort_order") return "order";
  return key.replace(/_([a-z])/gu, (_, letter) => letter.toUpperCase());
}

export function toRemoteRecord(value) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [camelToSnake(key), item]));
}

export function fromRemoteRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [snakeToCamel(key), item]));
}

function decodeJwtRole(key) {
  try {
    const payload = key.split(".")[1];
    if (!payload) return "";
    const normalized = payload.replace(/-/gu, "+").replace(/_/gu, "/");
    return JSON.parse(globalThis.atob(normalized)).role ?? "";
  } catch { return ""; }
}

export function assertBrowserSafeSupabaseConfig({ url, publishableKey }) {
  if (!url || !publishableKey) throw new SupabaseConfigurationError("Supabase URL and publishable key are required.");
  const parsed = new URL(assertSafeUrl(url));
  if (parsed.protocol !== "https:") throw new SupabaseConfigurationError("Supabase requires HTTPS.");
  if (/service[_-]?role/iu.test(publishableKey) || decodeJwtRole(publishableKey) === "service_role") {
    throw new SupabaseConfigurationError("Service-role keys are forbidden in the browser.");
  }
  return { url: parsed.href.replace(/\/$/u, ""), publishableKey };
}

export class SupabaseProvider extends DataProvider {
  constructor({ url, publishableKey, fetchFunction = globalThis.fetch, getAccessToken = async () => null } = {}) {
    super();
    this.configuration = { url, publishableKey };
    this.fetch = fetchFunction;
    this.getAccessToken = getAccessToken;
    this.opened = false;
  }

  async open() {
    if (typeof this.fetch !== "function") throw new SupabaseConfigurationError("Fetch is unavailable.");
    this.configuration = assertBrowserSafeSupabaseConfig(this.configuration);
    this.opened = true;
    return this;
  }

  close() { this.opened = false; }

  async #request(path, { method = "GET", body, headers = {} } = {}) {
    if (!this.opened) throw new SupabaseConfigurationError("SupabaseProvider is not open.");
    const accessToken = await this.getAccessToken();
    const response = await this.fetch(`${this.configuration.url}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: this.configuration.publishableKey,
        Authorization: `Bearer ${accessToken || this.configuration.publishableKey}`,
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      let details = errorText;
      try { details = JSON.parse(errorText); } catch { /* Keep non-JSON server response as text. */ }
      throw new SupabaseRequestError("Supabase request failed.", { status: response.status, details });
    }
    if (response.status === 204 || method === "HEAD") return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  #table(storeName) { assertStoreName(storeName); return STORE_TABLES[storeName]; }

  async get(storeName, key) {
    const column = KEY_COLUMNS[storeName] ?? "id";
    const rows = await this.#request(`${this.#table(storeName)}?${column}=eq.${encodeURIComponent(key)}&select=*&limit=1`);
    return rows?.[0] ? fromRemoteRecord(rows[0]) : null;
  }

  async getAll(storeName, { index, query } = {}) {
    const filter = index ? `&${camelToSnake(index)}=eq.${encodeURIComponent(query)}` : "";
    const rows = await this.#request(`${this.#table(storeName)}?select=*${filter}`);
    return (rows ?? []).map(fromRemoteRecord);
  }

  async count(storeName, options = {}) { return (await this.getAll(storeName, options)).length; }

  async put(storeName, value) {
    const rows = await this.#request(this.#table(storeName), {
      method: "POST", body: toRemoteRecord(value), headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    });
    return rows?.[0] ? fromRemoteRecord(rows[0]) : value[KEY_COLUMNS[storeName] ?? "id"];
  }

  async bulkPut(collections) {
    for (const [storeName, values] of Object.entries(collections)) {
      if (!values.length) continue;
      await this.#request(this.#table(storeName), {
        method: "POST", body: values.map(toRemoteRecord), headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      });
    }
  }

  async applyStockMovement({ workspaceId, productId, expectedBeforeQuantity, afterQuantity, movement, audit }) {
    const result = await this.#request("rpc/apply_stock_movement", {
      method: "POST",
      body: {
        p_workspace_id: workspaceId, p_product_id: productId, p_expected_before: expectedBeforeQuantity,
        p_after_quantity: afterQuantity, p_movement: toRemoteRecord(movement), p_audit: toRemoteRecord(audit),
      },
    });
    return {
      product: fromRemoteRecord(result.product), movement: fromRemoteRecord(result.movement), audit: fromRemoteRecord(result.audit),
    };
  }

  async delete(storeName, key) {
    const column = KEY_COLUMNS[storeName] ?? "id";
    await this.#request(`${this.#table(storeName)}?${column}=eq.${encodeURIComponent(key)}`, { method: "DELETE" });
  }

  async deleteWorkspace(workspaceId) {
    await this.#request(`workspaces?id=eq.${encodeURIComponent(workspaceId)}`, { method: "DELETE" });
  }
}
