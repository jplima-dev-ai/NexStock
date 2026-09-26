import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("NexCopy explica campos importantes sem depender de placeholder ou tooltip", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque NexCopy");
  await page.goto(appRoute("/products/new"));

  const minimum = page.locator("#product-minimum");
  await expect(minimum).toHaveAttribute("aria-describedby", /product-minimum-help product-minimum-example/u);
  await expect(page.locator("#product-minimum-help")).toContainText("alerta de reposição");
  await expect(page.locator("#product-minimum-example")).toContainText("Exemplo fictício");
  await expect(minimum).not.toHaveAttribute("placeholder", /.+/u);

  await page.goto(appRoute("/movements"));
  await expect(page.locator("#movement-type-help")).toContainText("Entrada soma unidades");
  await expect(page.locator("#movement-reason-example")).toContainText("equipamentos 1042");

  await page.goto(appRoute("/scenario"));
  await expect(page.locator("#scenario-value-help")).toContainText("unidades, novo mínimo ou aumento percentual");
  await expect(page.locator("[title]")).toHaveCount(0);
});
