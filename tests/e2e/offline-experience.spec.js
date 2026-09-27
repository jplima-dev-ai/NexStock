import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, monitorRuntimeErrors } from "./helpers.js";

test("Experiência offline explica estados sem depender de cor", async ({ page, context }) => {
  const errors = monitorRuntimeErrors(page);
  await createTechnologyWorkspace(page, "Estoque Offline");
  await page.goto(appRoute("/settings/pwa"));
  const offline = page.getByRole("heading", { level: 3, name: "Experiência offline" }).locator("..");
  await expect(offline.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(offline.locator("dl")).toContainText("Online");
  await expect(offline.locator("dl")).toContainText("Salvo localmente");
  await expect(offline.locator("dl")).toContainText("Não configurada");
  await context.setOffline(true);
  await page.reload();
  await expect(offline.locator("dl")).toContainText("Offline");
  await context.setOffline(false);
  expect(errors).toEqual([]);
});
