import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("Storage Lifecycle explica retenção sem oferecer exclusão automática", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Lifecycle");
  await page.goto(appRoute("/settings/data/storage"));
  const center = page.getByRole("heading", { level: 3, name: "Ciclo de armazenamento" }).locator("..");
  await expect(center).toContainText("Nenhum dado do estoque é apagado automaticamente");
  await expect(center.locator("dl")).toContainText("Dados do estoque");
  await expect(center.locator("dl")).toContainText("Preservados até uma ação explícita");
});
