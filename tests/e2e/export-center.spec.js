import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, monitorRuntimeErrors, selectOptionContaining } from "./helpers.js";

async function downloadText(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

test("CSV exporta somente os produtos que atendem aos filtros atuais", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await createTechnologyWorkspace(page, "Estoque Exportação");
  await page.goto(appRoute("/settings/data/export"));
  await expect(page.getByRole("heading", { level: 3, name: "Central de exportação" })).toBeVisible();
  await page.getByLabel("Buscar nos dados").fill("Quantum SSD");
  await page.getByRole("button", { name: "Gerar prévia da exportação" }).click();
  await expect(page.getByText("Quantidade de registros que serão exportados: 1.")).toBeVisible();
  await expect(page.getByRole("table")).toContainText("Quantum SSD");
  await expect(page.getByRole("table")).not.toContainText("Orion Notebook");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Baixar em CSV" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("nexstock-estoque-exportacao-products.csv");
  const csv = await downloadText(download);
  expect(csv).toContain("Quantum SSD");
  expect(csv).not.toContain("Orion Notebook");
  expect(runtimeErrors).toEqual([]);
});

test("JSON respeita produto selecionado e impressão usa a prévia filtrada", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Formatos");
  await page.goto(appRoute("/settings/data/export"));
  await page.getByLabel("Formato").selectOption("json");
  await selectOptionContaining(page, "#export-product", "Orbit Keyboard");
  await page.getByRole("button", { name: "Gerar prévia da exportação" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Baixar em JSON" }).click(),
  ]);
  const exported = JSON.parse(await downloadText(download));
  expect(exported.schema).toBe("nexstock-export-v1");
  expect(exported.count).toBe(1);
  expect(exported.records[0].name).toBe("Orbit Keyboard");

  await page.evaluate(() => { window.print = () => { window.__nexstockPrintCalled = true; }; });
  await page.getByLabel("Formato").selectOption("print");
  await page.getByRole("button", { name: "Gerar prévia da exportação" }).click();
  await page.getByRole("button", { name: "Abrir impressão" }).click();
  await expect.poll(() => page.evaluate(() => window.__nexstockPrintCalled)).toBe(true);
  await expect(page.locator("body")).not.toHaveClass(/is-export-print/u);
  await expect(page.getByRole("table")).toContainText("Orbit Keyboard");
  await expect(page.getByRole("table")).not.toContainText("Quantum SSD");
});
