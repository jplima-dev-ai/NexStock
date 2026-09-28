import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, monitorRuntimeErrors, selectOptionContaining } from "./helpers.js";

test("módulos centrais compartilham um workspace sem perder controle local", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await createTechnologyWorkspace(page, "Integração NexStock");

  await page.goto(appRoute("/products/new"));
  await page.locator("#product-name").fill("Produto integrado");
  await page.locator("#product-quantity").fill("1");
  await page.locator("#product-minimum").fill("2");
  await page.locator("#product-purchase-price").fill("10");
  await page.locator("#product-sale-price").fill("20");
  await page.locator("#product-location").fill("I-01");
  await page.locator("#custom-model").fill("INT-72");
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Detalhes do produto");

  await page.getByRole("button", { name: "Movimentar estoque" }).click();
  await selectOptionContaining(page, "#movement-product", "Produto integrado");
  await page.locator("#movement-type").selectOption("IN");
  await page.locator("#movement-quantity").fill("2");
  await page.locator("#movement-reason").fill("Integração de estoque");
  await page.getByRole("button", { name: "Calcular impacto" }).click();
  await page.getByRole("button", { name: "Confirmar entrada de 2 unidades" }).click();
  await expect(page.getByText("Integração de estoque", { exact: true })).toBeVisible();

  await page.goto(appRoute("/dashboard"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Painel");
  await expect(page.getByRole("heading", { level: 2, name: "Ações para revisar" })).toBeVisible();

  await page.goto(appRoute("/scenario"));
  await selectOptionContaining(page, "#scenario-product", "Produto integrado");
  await page.locator("#scenario-type").selectOption("saida");
  await page.locator("#scenario-value").fill("1");
  await page.getByRole("button", { name: "Simular cenário" }).click();
  await expect(page.getByText("Não persistido", { exact: true })).toBeVisible();

  for (const [route, title] of [["/time-machine", "Time Machine"], ["/settings/data/privacy", "Configurações"], ["/settings/pwa", "Configurações"]]) {
    await page.goto(appRoute(route));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  }

  await page.goto(appRoute("/shield-test"));
  await page.getByRole("button", { name: "Executar testes isolados" }).click();
  await expect(page.getByText("Todos os testes passaram")).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
