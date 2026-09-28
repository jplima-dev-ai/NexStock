import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("cadastro inválido oferece resumo focável e atalho por teclado ao campo", async ({ page }) => {
  await createTechnologyWorkspace(page, "UX refinement workspace");
  await page.goto(appRoute("/products/new"));
  await page.getByRole("button", { name: "Salvar produto" }).click();

  const summary = page.getByRole("alert");
  await expect(summary).toBeFocused();
  const nameLink = summary.getByRole("link", { name: /Nome/ });
  await expect(nameLink).toBeVisible();
  await nameLink.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#product-name")).toBeFocused();
});
