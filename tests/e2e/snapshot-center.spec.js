import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, monitorRuntimeErrors } from "./helpers.js";

test("Snapshots locais cria ponto nomeado e pede confirmação para excluir", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await createTechnologyWorkspace(page, "Estoque Snapshots");
  await page.goto(appRoute("/settings/data/snapshots"));
  await expect(page.getByRole("heading", { level: 3, name: "Snapshots locais" })).toBeVisible();
  await page.getByLabel("Nome do snapshot").fill("Antes da revisão");
  await page.getByRole("button", { name: "Criar snapshot local" }).click();
  await expect(page.getByText("Snapshot local criado.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 5, name: "Antes da revisão" })).toBeVisible();
  await page.getByRole("button", { name: "Excluir snapshot" }).click();
  await expect(page.getByRole("button", { name: "Excluir snapshot", exact: true })).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
