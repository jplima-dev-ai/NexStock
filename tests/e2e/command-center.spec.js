import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, selectOptionContaining } from "./helpers.js";

test("Command Center executa entrada e simulação pelo teclado", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Command Center");
  await page.goto(appRoute("/movements"));
  await selectOptionContaining(page, "#movement-product", "NX-COMP-0002");
  const productValue = await page.locator("#movement-product").inputValue();
  await page.goto(appRoute("/dashboard"));

  await page.keyboard.press("Control+K");
  await page.getByLabel("Buscar comandos e produtos").fill("entrada Quantum");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#\/movements$/u);
  await expect(page.locator("#movement-product")).toHaveValue(productValue);
  await expect(page.locator("#movement-type")).toHaveValue("IN");

  await page.keyboard.press("Control+K");
  await page.getByLabel("Buscar comandos e produtos").fill("simular Quantum");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#\/scenario$/u);
  await expect(page.locator("#scenario-product")).toHaveValue(productValue);
});

test("NexQuery aplica filtro de estoque pelo teclado", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque NexQuery");
  await page.keyboard.press("Control+K");
  await page.getByLabel("Buscar comandos e produtos").fill("sem estoque");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#\/products$/u);
  await expect(page.locator("#product-status-filter")).toHaveValue("out");
  await expect(page.locator("#product-archived-filter")).toHaveValue("active");
});
