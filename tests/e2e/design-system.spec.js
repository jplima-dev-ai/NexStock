import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("NexDesign aplica tokens, temas, iconografia e tabela responsiva no navegador", async ({ page }) => {
  await page.goto(appRoute("/welcome"));

  const lightTokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const value = (token) => styles.getPropertyValue(token).trim();
    return {
      background: value("--ns-color-background"),
      surface: value("--ns-color-surface"),
      surfaceAlt: value("--ns-color-surface-alt"),
      elevated: value("--ns-color-elevated"),
      overlay: value("--ns-color-overlay"),
      display: value("--ns-font-size-display"),
      metric: value("--ns-font-size-metric"),
      spacing: value("--ns-space-16"),
    };
  });
  expect(Object.values(lightTokens).every(Boolean)).toBe(true);
  expect(new Set([lightTokens.background, lightTokens.surface, lightTokens.surfaceAlt]).size).toBe(3);
  await expect(page.locator("#theme-toggle .ns-icon")).toHaveCount(1);

  await page.locator("#theme-toggle").click();
  const darkTokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return ["--ns-color-background", "--ns-color-surface", "--ns-color-surface-alt", "--ns-color-elevated"]
      .map((token) => styles.getPropertyValue(token).trim());
  });
  expect(new Set(darkTokens).size).toBe(4);

  await createTechnologyWorkspace(page, "Estoque NexDesign");
  await page.goto(appRoute("/products"));
  const nameSort = page.getByRole("button", { name: "Nome" });
  await nameSort.click();
  await expect(nameSort.locator("xpath=..")).toHaveAttribute("aria-sort", "ascending");
  await nameSort.click();
  await expect(nameSort.locator("xpath=..")).toHaveAttribute("aria-sort", "descending");
  await expect(page.locator(".ns-status .ns-icon").first()).toBeVisible();

  await page.setViewportSize({ width: 320, height: 720 });
  await expect(page.locator(".ns-table-wrapper")).toHaveAttribute("data-mobile-layout", "cards");
  await expect(nameSort).toBeVisible();
  expect(await page.locator(".ns-table tbody").evaluate((element) => getComputedStyle(element).display)).toBe("grid");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
