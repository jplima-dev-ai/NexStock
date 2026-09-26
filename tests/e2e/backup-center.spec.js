import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, monitorRuntimeErrors } from "./helpers.js";

test("NexBackup baixa uma cópia completa e permite revisar a restauração", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await createTechnologyWorkspace(page, "Estoque Backup");
  await page.goto(appRoute("/settings/data/backup"));
  await expect(page.getByRole("heading", { level: 3, name: "NexBackup" })).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Baixar backup completo" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^nexstock-backup-estoque-backup-\d{4}-\d{2}-\d{2}\.json$/u);
  await page.getByLabel("Arquivo de backup").setInputFiles(await download.path());
  await expect(page.getByRole("heading", { level: 4, name: "Revisão do backup" })).toBeVisible();
  await expect(page.getByText("Produtos: 5")).toBeVisible();
  await expect(page.getByRole("button", { name: "Restaurar e substituir dados" })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("arquivo inválido é recusado antes da confirmação", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Seguro");
  await page.goto(appRoute("/settings/data/backup"));
  await page.getByLabel("Arquivo de backup").setInputFiles({ name: "invalido.json", mimeType: "application/json", buffer: Buffer.from('{"schema":"future"}') });
  await expect(page.getByText(/Nenhuma alteração foi feita/u)).toBeVisible();
  await expect(page.getByRole("button", { name: "Restaurar e substituir dados" })).toHaveCount(0);
});
