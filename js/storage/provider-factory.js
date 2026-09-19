import { IndexedDBProvider } from "./indexeddb-provider.js";
import { SupabaseProvider } from "./supabase-provider.js";

export const PROVIDER_TYPES = Object.freeze({ INDEXED_DB: "indexeddb", SUPABASE: "supabase" });

function meta(documentObject, name) {
  return documentObject?.querySelector?.(`meta[name="${name}"]`)?.content?.trim() ?? "";
}

export function readProviderConfig(documentObject = globalThis.document) {
  return Object.freeze({
    type: meta(documentObject, "nexstock-data-provider") || PROVIDER_TYPES.INDEXED_DB,
    supabaseUrl: meta(documentObject, "nexstock-supabase-url"),
    publishableKey: meta(documentObject, "nexstock-supabase-publishable-key"),
  });
}

export function createDataProvider({ config = readProviderConfig(), indexedDBOptions = {}, fetchFunction, getAccessToken } = {}) {
  if (config.type === PROVIDER_TYPES.INDEXED_DB) return new IndexedDBProvider(indexedDBOptions);
  if (config.type === PROVIDER_TYPES.SUPABASE) {
    return new SupabaseProvider({ url: config.supabaseUrl, publishableKey: config.publishableKey, fetchFunction, getAccessToken });
  }
  throw new RangeError(`Unsupported data provider: ${config.type}`);
}
