import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("fluxos principais preservam título, foco e linguagem coerentes", async ({ page }) => {
  await createTechnologyWorkspace(page, "Product coherence workspace");
  for (const route of ["/dashboard", "/products", "/movements", "/insights", "/scenario", "/time-machine", "/settings"]) {
    await page.goto(appRoute(route));
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  }
  await page.locator("#locale-select").selectOption("en-US");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});
