import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("NexMigrate explica a preservação do schema local", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Migração");
  await page.goto(appRoute("/settings/advanced"));
  const center = page.getByRole("heading", { level: 3, name: "NexMigrate" }).locator("..");
  await expect(center.locator("dl")).toContainText("Somente aditiva; sem exclusão silenciosa");
  await expect(center.locator("dl")).toContainText("Atualizado");
});
