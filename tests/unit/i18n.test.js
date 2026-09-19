import test from "node:test";
import assert from "node:assert/strict";
import { I18n, interpolateMessage } from "../../js/i18n/i18n.js";

function createI18n(catalogs) {
  return new I18n({
    defaultLocale: "pt-BR",
    supportedLocales: ["pt-BR", "en-US", "es"],
    loader: async (locale) => catalogs[locale],
  });
}

test("inicializa, alterna idioma e interpola parâmetros", async () => {
  const i18n = createI18n({
    "pt-BR": { greeting: "Olá, {name}!" },
    "en-US": { greeting: "Hello, {name}!" },
    es: { greeting: "¡Hola, {name}!" },
  });
  await i18n.init();
  assert.equal(i18n.t("greeting", { name: "Ana" }), "Olá, Ana!");
  await i18n.setLocale("en-US");
  assert.equal(i18n.t("greeting", { name: "Ana" }), "Hello, Ana!");
});

test("usa pt-BR como fallback e a chave como último recurso", async () => {
  const i18n = createI18n({
    "pt-BR": { shared: { action: "Continuar" } },
    "en-US": {},
    es: {},
  });
  await i18n.init("en-US");
  assert.equal(i18n.t("shared.action"), "Continuar");
  assert.equal(i18n.t("missing.message"), "missing.message");
});

test("rejeita locale fora da lista permitida", async () => {
  const i18n = createI18n({ "pt-BR": {}, "en-US": {}, es: {} });
  await i18n.init();
  await assert.rejects(i18n.setLocale("fr"), RangeError);
});

test("interpolação preserva texto como texto, sem interpretar HTML", () => {
  assert.equal(interpolateMessage("Item: {value}", { value: "<b>caixa</b>" }), "Item: <b>caixa</b>");
  assert.equal(interpolateMessage("Rota {route}"), "Rota {route}");
});
