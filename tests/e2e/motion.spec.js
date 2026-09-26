import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("NexMotion aplica movimento curto a rotas, tabs, diálogo, sidebar, estados e números", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque NexMotion");

  const route = page.locator("#main-content > .ns-route-enter");
  await expect(route).toBeVisible();
  expect(await route.evaluate((element) => getComputedStyle(element).animationName)).toBe("ns-route-enter");

  const metric = page.locator(".ns-metric__value").first();
  await expect(metric).toBeVisible();
  expect(await metric.evaluate((element) => getComputedStyle(element).animationName)).toBe("ns-number-enter");

  await page.goto(appRoute("/insights"));
  const feedback = page.locator(".ns-alert").first();
  await expect(feedback).toBeVisible();
  expect(await feedback.evaluate((element) => getComputedStyle(element).animationName)).toBe("ns-surface-enter");
  const card = page.locator(".ns-card").first();
  await expect(card).toBeVisible();
  expect(await card.evaluate((element) => getComputedStyle(element).animationName)).toBe("ns-surface-enter");
  const firstTab = page.getByRole("tab").first();
  const secondTab = page.getByRole("tab").nth(1);
  await firstTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(firstTab).toHaveAttribute("aria-selected", "false");
  await expect(secondTab).toHaveAttribute("aria-selected", "true");
  await expect(secondTab).toBeFocused();
  const activePanel = page.getByRole("tabpanel").filter({ visible: true }).first();
  expect(await activePanel.evaluate((element) => getComputedStyle(element).animationName)).toBe("ns-surface-enter");

  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: "Paleta de comandos" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => getComputedStyle(element).transitionDuration)).toContain("0.18s");
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 320, height: 720 });
  await page.getByRole("button", { name: "Abrir menu" }).click();
  const navigation = page.locator("#primary-nav");
  await expect(navigation).toHaveAttribute("data-open", "true");
  expect(await navigation.evaluate((element) => getComputedStyle(element).animationName)).toBe("ns-sidebar-open");

  await page.goto(appRoute("/products"));
  const badge = page.locator(".ns-status").first();
  await expect(badge).toBeVisible();
  expect(await badge.evaluate((element) => getComputedStyle(element).animationName)).toBe("ns-badge-enter");
});

test("movimento reduzido remove transforms e não bloqueia teclado ou navegação", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(appRoute("/welcome"));

  const route = page.locator("#main-content > .ns-route-enter");
  await expect(route).toBeVisible();
  expect(await route.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  expect(await route.evaluate((element) => getComputedStyle(element).transform)).toBe("none");

  await page.getByRole("button", { name: "Abrir menu" }).click();
  const navigation = page.locator("#primary-nav");
  await expect(navigation).toHaveAttribute("data-open", "true");
  expect(await navigation.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");

  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: "Paleta de comandos" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
  await page.keyboard.press("Escape");
  await expect(page.locator("#command-palette-trigger")).toBeFocused();

  await page.goto(appRoute("/products"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Produtos");
  const alert = page.locator(".ns-alert");
  await expect(alert).toBeVisible();
  expect(await alert.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
});
