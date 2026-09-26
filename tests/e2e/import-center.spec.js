import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, monitorRuntimeErrors, readIndexedDbSnapshot } from "./helpers.js";

async function selectCsv(page, content, name = "produtos.csv") {
  await page.getByLabel("Arquivo CSV").setInputFiles({ name, mimeType: "text/csv", buffer: Buffer.from(content) });
  await expect(page.getByRole("heading", { level: 4, name: "Mapeamento de colunas" })).toBeVisible();
  await page.getByRole("button", { name: "Revisar linhas" }).click();
  await expect(page.getByRole("heading", { level: 4, name: "Prévia e correção" })).toBeVisible();
}

test("prévia não altera dados, permite corrigir e exige confirmação explícita", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await createTechnologyWorkspace(page, "Estoque Importação");
  const before = await readIndexedDbSnapshot(page);
  await page.goto(appRoute("/settings/data/import"));
  await expect(page.getByRole("heading", { level: 3, name: "Central de importação" })).toBeVisible();

  await selectCsv(page, "Nome,Quantidade,Estoque mínimo\nProduto CSV A,-2,3");
  await expect(page.getByText("Nenhuma alteração foi feita ainda.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar para confirmação" })).toBeDisabled();
  await expect(page.getByText(/Quantidade atual: informe um número igual ou maior que zero/u)).toBeVisible();
  expect((await readIndexedDbSnapshot(page)).products).toEqual(before.products);

  await page.getByLabel("Quantidade atual").fill("12");
  await page.getByRole("button", { name: "Validar correções" }).click();
  const confirm = page.getByRole("button", { name: "Continuar para confirmação" });
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole("heading", { name: "Confirmar importação" })).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(confirm).toBeFocused();

  await confirm.click();
  await page.getByRole("button", { name: "Importar produtos" }).click();
  await expect(page.getByText("1 produtos foram importados com seus registros de auditoria.")).toBeVisible();
  const after = await readIndexedDbSnapshot(page);
  expect(after.products).toHaveLength(before.products.length + 1);
  expect(after.products.some(({ name, currentQuantity }) => name === "Produto CSV A" && currentQuantity === 12)).toBe(true);
  expect(runtimeErrors).toEqual([]);
});

test("produto duplicado bloqueia a importação sem corromper o espaço de trabalho", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Duplicatas");
  const before = await readIndexedDbSnapshot(page);
  const existingName = before.products[0].name;
  await page.goto(appRoute("/settings/data/import"));
  await selectCsv(page, `Nome,Quantidade,Estoque mínimo\n${existingName},4,1`);
  await expect(page.getByText(/já existe um produto com este nome/u)).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar para confirmação" })).toBeDisabled();
  expect((await readIndexedDbSnapshot(page)).products).toEqual(before.products);
  await page.reload();
  expect((await readIndexedDbSnapshot(page)).products).toEqual(before.products);
});
