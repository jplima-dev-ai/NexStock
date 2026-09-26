import { expect } from "@playwright/test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
export const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
export const appRoute = (route = "/welcome") => `/nexstock/#${route}`;

export function monitorRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

export async function createTechnologyWorkspace(page, name = "Estoque E2E") {
  await page.goto(appRoute("/onboarding"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Configuração inicial");
  await page.getByRole("button", { name: "Começar configuração" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Escolha o perfil do seu estoque");
  await page.locator("#profile-technology").check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Nome do espaço de trabalho").fill(name);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Criar espaço de trabalho" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Painel");
}

export async function selectOptionContaining(page, selector, text) {
  const option = page.locator(`${selector} option`).filter({ hasText: text }).first();
  const value = await option.getAttribute("value");
  if (!value) throw new Error(`Opção não encontrada em ${selector}: ${text}`);
  await page.locator(selector).selectOption(value);
  return value;
}

export async function readIndexedDbSnapshot(page) {
  return page.evaluate(async () => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open("nexstock-db");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stores = [...database.objectStoreNames];
    const transaction = database.transaction(["workspaces", "products", "movements"], "readonly");
    const readAll = (store) => new Promise((resolve, reject) => {
      const request = transaction.objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const [workspaces, products, movements] = await Promise.all([
      readAll("workspaces"), readAll("products"), readAll("movements"),
    ]);
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
    return { stores, workspaces, products, movements };
  });
}

export async function expectNoSeriousAxeViolations(page) {
  const results = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
  }));
  const blocking = results.violations.filter(({ impact }) => ["critical", "serious"].includes(impact));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}
