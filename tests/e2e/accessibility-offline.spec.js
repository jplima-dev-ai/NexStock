import { test, expect } from "@playwright/test";
import { appRoute, axeSource, createTechnologyWorkspace, expectNoSeriousAxeViolations } from "./helpers.js";

test("axe não encontra violações sérias ou críticas nas superfícies centrais", async ({ page }) => {
  await page.addInitScript({ content: axeSource });
  await page.goto(appRoute("/welcome"));
  await expectNoSeriousAxeViolations(page);
  await createTechnologyWorkspace(page, "Estoque Axe");
  for (const route of ["/dashboard", "/products", "/movements", "/insights", "/glossary", "/settings", "/settings/appearance", "/settings/data/import", "/settings/data/export", "/settings/data/backup", "/settings/data/snapshots", "/settings/data/privacy", "/settings/security", "/shield-test", "/health"] ) {
    await page.goto(appRoute(route));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  }
});

test("shell reabre offline após a primeira visita e anuncia a conectividade", async ({ page, context }) => {
  await page.goto(appRoute("/welcome"));
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Boas-vindas");

  await context.setOffline(true);
  await page.goto(appRoute("/products"), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Produtos");
  await expect(page.getByText("Você está offline. Pode continuar trabalhando com os dados disponíveis neste dispositivo.")).toBeVisible();
  await context.setOffline(false);
});
