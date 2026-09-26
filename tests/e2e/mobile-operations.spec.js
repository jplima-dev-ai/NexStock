import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("operações móveis usam navegação inferior, busca e ação rápida", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Mobile");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appRoute("/dashboard"));
  await expect(page.locator("#mobile-bottom-nav")).toBeVisible();
  await page.getByRole("button", { name: "Ações" }).click();
  await expect(page.getByRole("dialog", { name: "Ações rápidas" })).toBeVisible();
  await page.getByRole("button", { name: "Registrar entrada" }).click();
  await expect(page).toHaveURL(/#\/movements$/u);
  await expect(page.locator("#movement-type")).toHaveValue("IN");
  await page.locator("#mobile-search").click();
  await expect(page.getByRole("dialog", { name: "Paleta de comandos" })).toBeVisible();
});
