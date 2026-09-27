import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("Central PWA apresenta versão e estado de atualização sem interromper trabalho", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Atualização");
  await page.goto(appRoute("/settings/pwa"));
  const center = page.getByRole("heading", { level: 3, name: "Central de atualização PWA" }).locator("..");
  await expect(center.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(center.locator("dl")).toContainText("1.7.0");
  await expect(center.locator("dl")).toContainText("Gerenciado pelo service worker");
  await expect(page.getByRole("button", { name: "Atualizar agora" })).toBeDisabled();
});
