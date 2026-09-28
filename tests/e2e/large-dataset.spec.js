import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

test("catálogo grande mantém filtro, paginação e foco utilizáveis por teclado", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque extenso");
  const workspaceId = await page.evaluate(async () => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open("nexstock-db");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction("workspaces", "readonly");
    const workspaces = await new Promise((resolve, reject) => {
      const request = transaction.objectStore("workspaces").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return workspaces[0].id;
  });
  await page.evaluate(async ({ workspaceId }) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open("nexstock-db");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction("products", "readwrite");
    for (let index = 1; index <= 55; index += 1) {
      transaction.objectStore("products").put({
        id: `large-product-${index}`, workspaceId, name: `Produto de volume ${String(index).padStart(2, "0")}`,
        nexCode: `NX-GEN-${String(index + 100).padStart(4, "0")}`, currentQuantity: 10, minimumStock: 2,
        purchasePrice: 1, salePrice: 2, trackingMode: "bulk", categoryId: null, supplierId: null,
        location: "A-01", customData: {}, createdAt: "2026-09-28T12:00:00.000Z", updatedAt: "2026-09-28T12:00:00.000Z", archivedAt: null,
      });
    }
    await new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
  }, { workspaceId });

  await page.goto(appRoute("/products"));
  await expect(page.locator(".product-results__summary")).toContainText("Exibindo 1 a 25 de 60 produtos.");
  await expect(page.locator(".ns-table tbody tr")).toHaveCount(25);
  const next = page.getByRole("button", { name: "Próxima página" });
  await next.click();
  await expect(page.getByText("Página 2 de 3", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Página anterior" })).toBeFocused();

  await page.locator("#product-search").fill("Produto de volume 54");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.locator(".product-results__summary")).toContainText("Exibindo 1 a 1 de 1 produtos.");
  await expect(page.getByText("Produto de volume 54", { exact: true })).toBeVisible();
});
