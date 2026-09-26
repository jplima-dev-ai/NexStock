import { test, expect } from "@playwright/test";
import { appRoute } from "./helpers.js";

test("idiomas, tema, teclado e foco preservam o contrato acessível", async ({ page }) => {
  await page.goto(appRoute("/welcome"));

  const skipLink = page.locator("#skip-link");
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.keyboard.press("Control+K");
  await expect(page.getByRole("dialog", { name: "Paleta de comandos" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#command-palette-trigger")).toBeFocused();

  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#theme-toggle")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.locator("#locale-select").selectOption("en-US");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome");
  await page.locator("#locale-select").selectOption("es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bienvenida");
  await page.locator("#locale-select").selectOption("pt-BR");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Boas-vindas");
});
