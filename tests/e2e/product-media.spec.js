import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, selectOptionContaining } from "./helpers.js";

test("Product Media salva imagem e descrição acessível offline", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Product Media");
  await page.goto(appRoute("/movements"));
  const productId = await selectOptionContaining(page, "#movement-product", "NX-COMP-0002");
  await page.goto(appRoute(`/products/${productId}/edit`));
  await page.getByLabel("Arquivo de imagem").setInputFiles({ name: "quantum.png", mimeType: "image/png", buffer: Buffer.from("89504e470d0a1a0a", "hex") });
  await page.getByLabel("Descrição da imagem").fill("Foto frontal do Quantum SSD");
  await page.getByLabel("Modelo obrigatório").fill("Q-1");
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page.getByRole("img", { name: "Foto frontal do Quantum SSD" })).toBeVisible();
});
