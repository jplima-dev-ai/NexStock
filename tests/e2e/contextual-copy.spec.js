import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("modo guiado apresenta exemplos específicos do perfil e glossário pesquisável", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Guiado");
  await page.goto(appRoute("/products/new"));
  await expect(page.getByText("Modo guiado: ajuda e exemplos adaptados ao seu perfil estão visíveis.")).toBeVisible();
  await expect(page.locator("#product-name-example")).toContainText("Teclado mecânico Aurora");
  await expect(page.locator("#product-location-example")).toContainText("armário T");

  await page.goto(appRoute("/glossary"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Glossário");
  await expect(page.locator(".glossary-list dt")).toHaveCount(9);
  await page.locator("#glossary-search").fill("reposição");
  await expect(page.locator(".glossary-list dt")).toHaveCount(1);
  await expect(page.locator(".glossary-list dt")).toHaveText("Estoque mínimo");

  await page.locator("#locale-select").selectOption("en-US");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Glossary");
  await expect(page.locator("#glossary-search-help")).toContainText("Search by term");
});

test("modo compacto mantém ajuda essencial e oculta exemplos adicionais", async ({ page }) => {
  await page.goto(appRoute("/onboarding"));
  await page.getByRole("button", { name: "Começar configuração" }).click();
  await page.locator("#profile-food").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Nome do espaço de trabalho").fill("Estoque Compacto");
  await page.locator("#experience-mode").selectOption("compact");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Criar espaço de trabalho" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Painel");
  await page.goto(appRoute("/products/new"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Novo produto");

  await expect(page.getByText("Modo compacto: a ajuda essencial permanece visível e os exemplos adicionais ficam ocultos.")).toBeVisible();
  await expect(page.locator("#product-minimum-help")).toContainText("alerta de reposição");
  await expect(page.locator("#product-name-example")).toBeHidden();
  await expect(page.locator("#product-minimum-example")).toBeHidden();
  await expect(page.locator("#product-minimum")).toHaveAttribute("aria-describedby", "product-minimum-help");
});
