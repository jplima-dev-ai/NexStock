import test from "node:test";
import assert from "node:assert/strict";
import {
  assertBrowserSafeSupabaseConfig, fromRemoteRecord, SupabaseConfigurationError,
  SupabaseProvider, toRemoteRecord,
} from "../../js/storage/supabase-provider.js";
import { createDataProvider } from "../../js/storage/provider-factory.js";
import { IndexedDBProvider } from "../../js/storage/indexeddb-provider.js";

function response(body, { status = 200 } = {}) {
  return { ok: status >= 200 && status < 300, status, text: async () => body === null ? "" : JSON.stringify(body), json: async () => body };
}

test("mapeia registros entre camelCase e snake_case sem perder dados", () => {
  const remote = toRemoteRecord({ workspaceId: "w1", nexCode: "NX-1", order: 2, customData: { color: "blue" } });
  assert.deepEqual(remote, { workspace_id: "w1", nex_code: "NX-1", sort_order: 2, custom_data: { color: "blue" } });
  assert.deepEqual(fromRemoteRecord(remote), { workspaceId: "w1", nexCode: "NX-1", order: 2, customData: { color: "blue" } });
});

test("bloqueia HTTP e service-role no navegador", () => {
  assert.throws(() => assertBrowserSafeSupabaseConfig({ url: "http://project.supabase.co", publishableKey: "sb_publishable_public" }), SupabaseConfigurationError);
  assert.throws(() => assertBrowserSafeSupabaseConfig({ url: "https://project.supabase.co", publishableKey: "x.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.x" }), SupabaseConfigurationError);
});

test("provider usa token da sessão, RLS e filtro convertido", async () => {
  const calls = [];
  const provider = new SupabaseProvider({
    url: "https://project.supabase.co", publishableKey: "sb_publishable_public", getAccessToken: async () => "user-token",
    fetchFunction: async (url, options) => { calls.push({ url, options }); return response([{ id: "p1", workspace_id: "w1", nex_code: "NX-1" }]); },
  });
  await provider.open();
  const products = await provider.getAll("products", { index: "workspaceId", query: "w1" });
  assert.equal(products[0].workspaceId, "w1");
  assert.match(calls[0].url, /products\?select=\*&workspace_id=eq\.w1/u);
  assert.equal(calls[0].options.headers.Authorization, "Bearer user-token");
  assert.equal(calls[0].options.headers.apikey, "sb_publishable_public");
});

test("movimentação remota usa RPC transacional", async () => {
  let call;
  const provider = new SupabaseProvider({
    url: "https://project.supabase.co", publishableKey: "sb_publishable_public",
    fetchFunction: async (url, options) => { call = { url, options }; return response({ product: { id: "p1", current_quantity: 4 }, movement: { id: "m1" }, audit: { id: "a1" } }); },
  });
  await provider.open();
  const result = await provider.applyStockMovement({ workspaceId: "w1", productId: "p1", expectedBeforeQuantity: 5, afterQuantity: 4, movement: { id: "m1" }, audit: { id: "a1" } });
  assert.match(call.url, /rpc\/apply_stock_movement$/u);
  assert.equal(JSON.parse(call.options.body).p_expected_before, 5);
  assert.equal(result.product.currentQuantity, 4);
});

test("factory alterna providers somente por configuração", () => {
  assert.ok(createDataProvider({ config: { type: "indexeddb" } }) instanceof IndexedDBProvider);
  assert.ok(createDataProvider({ config: { type: "supabase", supabaseUrl: "https://project.supabase.co", publishableKey: "sb_publishable_public" } }) instanceof SupabaseProvider);
});
