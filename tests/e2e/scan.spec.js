import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, selectOptionContaining } from "./helpers.js";

test("NexScan inicia entrada por código manual sem depender da câmera", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque NexScan");
  await page.goto(appRoute("/movements"));
  const productId = await selectOptionContaining(page, "#movement-product", "NX-COMP-0002");
  await page.goto(appRoute("/scan"));
  await page.locator("#scan-code").fill("nx-comp-0002");
  await page.locator("#scan-action").selectOption("entry");
  await page.getByRole("button", { name: "Usar código ou busca manual" }).click();
  await expect(page).toHaveURL(/#\/movements$/u);
  await expect(page.locator("#movement-product")).toHaveValue(productId);
  await expect(page.locator("#movement-type")).toHaveValue("IN");
});
