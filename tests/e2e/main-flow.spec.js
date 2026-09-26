import { test, expect } from "@playwright/test";
import {
  appRoute,
  createTechnologyWorkspace,
  monitorRuntimeErrors,
  readIndexedDbSnapshot,
  selectOptionContaining,
} from "./helpers.js";

test("fluxo principal persiste produto e movimentações e isola o cenário", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await createTechnologyWorkspace(page);

  await page.goto(appRoute("/products/new"));
  await page.locator("#product-name").fill("Mouse E2E");
  await page.locator("#product-quantity").fill("5");
  await page.locator("#product-minimum").fill("2");
  await page.locator("#product-purchase-price").fill("75");
  await page.locator("#product-sale-price").fill("120");
  await page.locator("#product-location").fill("A-01");
  await page.locator("#custom-model").fill("QA-26");
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Detalhes do produto");
  await expect(page.getByText("Mouse E2E", { exact: true })).toBeVisible();
  await expect(page.locator("dt", { hasText: "NexCode" }).locator("+ dd")).toContainText("NX-");

  await page.getByRole("button", { name: "Movimentar estoque" }).click();
  await selectOptionContaining(page, "#movement-product", "Mouse E2E");
  await page.locator("#movement-type").selectOption("IN");
  await page.locator("#movement-quantity").fill("3");
  await page.locator("#movement-reason").fill("Entrada E2E");
  await page.getByRole("button", { name: "Calcular impacto" }).click();
  await expect(page.getByText("Prévia de impacto")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar entrada de 3 unidades" }).click();
  await expect(page.getByText("Entrada E2E", { exact: true })).toBeVisible();

  await selectOptionContaining(page, "#movement-product", "Mouse E2E");
  await page.locator("#movement-type").selectOption("OUT");
  await page.locator("#movement-quantity").fill("2");
  await page.locator("#movement-reason").fill("Saída E2E");
  await page.getByRole("button", { name: "Calcular impacto" }).click();
  await page.getByRole("button", { name: "Confirmar saída de 2 unidades" }).click();
  await expect(page.getByText("Saída E2E", { exact: true })).toBeVisible();

  let snapshot = await readIndexedDbSnapshot(page);
  const product = snapshot.products.find(({ name }) => name === "Mouse E2E");
  expect(product?.currentQuantity).toBe(6);
  expect(snapshot.movements.filter(({ productId }) => productId === product.id)).toHaveLength(2);
  expect(snapshot.stores).toEqual(expect.arrayContaining(["products", "movements", "auditLogs"]));

  await page.goto(appRoute("/scenario"));
  await selectOptionContaining(page, "#scenario-product", "Mouse E2E");
  await page.locator("#scenario-type").selectOption("saida");
  await page.locator("#scenario-value").fill("1");
  await page.getByRole("button", { name: "Simular cenário" }).click();
  await expect(page.getByText("Não persistido", { exact: true })).toBeVisible();

  snapshot = await readIndexedDbSnapshot(page);
  expect(snapshot.products.find(({ id }) => id === product.id)?.currentQuantity).toBe(6);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Scenario Lab");
  expect((await readIndexedDbSnapshot(page)).workspaces).toHaveLength(1);
  expect(runtimeErrors).toEqual([]);
});
