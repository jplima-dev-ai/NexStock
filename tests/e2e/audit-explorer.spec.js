import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";
test("Audit Explorer apresenta estado vazio compreensível", async ({ page }) => {
  await page.goto(appRoute("/onboarding")); await createTechnologyWorkspace(page, "Estoque Audit");
  await page.goto(appRoute("/audit"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Histórico");
  await expect(page.getByText("Ainda não há ações registradas neste espaço.")).toBeVisible();
});
