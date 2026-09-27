import { test, expect } from "@playwright/test";
import { appRoute, axeSource, createTechnologyWorkspace, expectNoSeriousAxeViolations, monitorRuntimeErrors } from "./helpers.js";

test("Privacy & Data Center explica armazenamento local com estrutura acessível", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await page.addInitScript({ content: axeSource });
  await createTechnologyWorkspace(page, "Estoque Privacidade");
  await page.goto(appRoute("/settings/data/privacy"));

  await expect(page.getByRole("heading", { level: 1, name: "Configurações" })).toBeFocused();
  await expect(page.getByRole("heading", { level: 3, name: "Privacidade e Central de dados" })).toBeVisible();
  await expect(page.getByText("Esta tela descreve a configuração atual. Ela não envia dados, não ativa sincronização e não mostra URL ou chave de acesso.")).toBeVisible();
  await expect(page.locator("dl")).toContainText("IndexedDB neste navegador e dispositivo");
  await expect(page.locator("dl")).toContainText("Não configurada; não há sincronização automática");
  await expect(page.getByRole("link", { name: "Abrir NexBackup" })).toHaveAttribute("href", "#/settings/data/backup");
  await page.getByRole("link", { name: "Abrir snapshots" }).focus();
  await expect(page.getByRole("link", { name: "Abrir snapshots" })).toBeFocused();
  await expectNoSeriousAxeViolations(page);
  expect(runtimeErrors).toEqual([]);
});
