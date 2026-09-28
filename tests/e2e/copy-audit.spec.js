import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("copy crítica de produto permanece compreensível nos três idiomas", async ({ page }) => {
  await createTechnologyWorkspace(page, "Copy audit workspace");
  await page.goto(appRoute("/products/new"));

  const expectations = [
    { locale: "pt-BR", title: "Novo produto", name: "Nome", minimum: "Estoque mínimo", save: "Salvar produto" },
    { locale: "en-US", title: "New product", name: "Name", minimum: "Minimum stock", save: "Save product" },
    { locale: "es", title: "Producto nuevo", name: "Nombre", minimum: "Existencias mínimas", save: "Guardar producto" },
  ];

  for (const expected of expectations) {
    await page.locator("#locale-select").selectOption(expected.locale);
    await expect(page.locator("html")).toHaveAttribute("lang", expected.locale);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(expected.title);
    await expect(page.getByLabel(expected.name)).toBeVisible();
    await expect(page.getByLabel(expected.minimum)).toBeVisible();
    await expect(page.getByRole("button", { name: expected.save })).toBeVisible();
  }
});
