import { test, expect } from "@playwright/test";
import { appRoute, monitorRuntimeErrors, readIndexedDbSnapshot } from "./helpers.js";

const matrix = [
  { profile: "technology", locale: "pt-BR", theme: "light", mode: "guided", viewport: { width: 1440, height: 900 }, title: "Painel", mobile: false },
  { profile: "cosmetics", locale: "en-US", theme: "dark", mode: "compact", viewport: { width: 390, height: 844 }, title: "Dashboard", mobile: true },
  { profile: "fashion", locale: "es", theme: "light", mode: "guided", viewport: { width: 1024, height: 768 }, title: "Panel", mobile: false },
  { profile: "food", locale: "en-US", theme: "dark", mode: "compact", viewport: { width: 375, height: 812 }, title: "Dashboard", mobile: true },
  { profile: "custom", locale: "pt-BR", theme: "light", mode: "compact", viewport: { width: 768, height: 1024 }, title: "Painel", mobile: false },
];

async function createWorkspace(page, entry) {
  await page.goto(appRoute("/onboarding"));
  await page.getByRole("button", { name: "Começar configuração" }).click();
  await page.locator(`#profile-${entry.profile}`).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.locator("#workspace-name").fill(`Matriz ${entry.profile}`);
  await page.locator("#experience-mode").selectOption(entry.mode);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Criar espaço de trabalho" }).click();
}

for (const entry of matrix) {
  test(`matriz: ${entry.profile}, ${entry.locale}, ${entry.theme}, ${entry.mode}`, async ({ page }) => {
    const runtimeErrors = monitorRuntimeErrors(page);
    await page.setViewportSize(entry.viewport);
    await createWorkspace(page, entry);
    await page.locator("#locale-select").selectOption(entry.locale);
    await expect(page.locator("html")).toHaveAttribute("lang", entry.locale);
    if (entry.theme === "dark") await page.locator("#theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", entry.theme);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(entry.title);
    await page.goto(appRoute("/products"));
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    if (entry.mobile) await expect(page.locator("#mobile-bottom-nav")).toBeVisible();
    else await expect(page.locator("#mobile-bottom-nav")).toBeHidden();
    const snapshot = await readIndexedDbSnapshot(page);
    expect(snapshot.workspaces).toHaveLength(1);
    expect(snapshot.products.length).toBeGreaterThan(0);
    expect(runtimeErrors).toEqual([]);
  });
}
