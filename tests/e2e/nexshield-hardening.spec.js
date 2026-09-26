import { test, expect } from "@playwright/test";
import { appRoute, monitorRuntimeErrors } from "./helpers.js";

test("NexShield 2.0 executa dez testes por teclado e anuncia o resultado", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await page.goto(appRoute("/shield-test"));

  const run = page.getByRole("button", { name: "Executar testes isolados" });
  for (let step = 0; step < 16 && !(await run.evaluate((element) => element === document.activeElement)); step += 1) {
    await page.keyboard.press("Tab");
  }
  await expect(run).toBeFocused();
  await page.keyboard.press("Enter");

  const results = page.locator('div[aria-live="polite"][tabindex="-1"]');
  await expect(results).toBeFocused();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Teste NexShield");
  await expect(page.getByText("Todos os testes passaram")).toBeVisible();
  await expect(results.getByRole("listitem")).toHaveCount(10);
  expect(runtimeErrors).toEqual([]);
});
