import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRoute, resolveRoute, ROUTES, Router } from "../../js/core/router.js";

test("normaliza hash vazio para a rota inicial", () => {
  assert.equal(normalizeRoute(""), "/welcome");
  assert.equal(normalizeRoute("#/"), "/welcome");
});

test("normaliza barras sem quebrar subdiretórios de hospedagem", () => {
  assert.equal(normalizeRoute("#/products/"), "/products");
  assert.equal(normalizeRoute("dashboard"), "/dashboard");
});

test("resolve todas as rotas estáticas exigidas pelo blueprint", () => {
  const expected = [
    "/welcome", "/onboarding", "/dashboard", "/products", "/products/new",
    "/movements", "/radar", "/insights", "/time-machine", "/scenario",
    "/kits", "/about", "/settings", "/settings/profiles",
    "/settings/security", "/shield-test",
  ];
  for (const route of expected) assert.ok(resolveRoute(route), `Rota ausente: ${route}`);
  assert.ok(ROUTES.length >= expected.length);
});

test("resolve parâmetros de produto e rejeita rota desconhecida", () => {
  assert.deepEqual(resolveRoute("/products/item-42").params, { id: "item-42" });
  assert.deepEqual(resolveRoute("/products/item-42/edit").params, { id: "item-42" });
  assert.equal(resolveRoute("/unknown"), null);
  assert.equal(resolveRoute("/products/%E0%A4%A"), null);
});

test("refresh preserva a rota e encaminha o contrato de foco", () => {
  const originalWindow = globalThis.window;
  globalThis.window = {
    location: { hash: "#/products" },
    addEventListener() {},
    removeEventListener() {},
  };
  try {
    let rendered;
    const router = new Router({
      onRouteChange: (definition, context) => { rendered = { definition, context }; },
      onNotFound: () => assert.fail("Rota conhecida não deve cair em not found."),
    });
    router.refresh({ moveFocus: false });
    assert.equal(rendered.definition.route, "/products");
    assert.deepEqual(rendered.context, { moveFocus: false });
  } finally {
    globalThis.window = originalWindow;
  }
});
