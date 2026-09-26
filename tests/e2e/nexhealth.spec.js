import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, monitorRuntimeErrors } from "./helpers.js";

test("NexHealth é navegável por teclado e anuncia um diagnóstico sem alterações", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  await page.goto(appRoute("/onboarding"));
  await createTechnologyWorkspace(page, "Estoque Health");
  await page.goto(appRoute("/health"));

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("NexHealth");
  await expect(page.getByText("Nenhuma inconsistência detectável")).toBeVisible();
  const run = page.getByRole("button", { name: "Executar novo diagnóstico" });
  for (let step = 0; step < 16 && !(await run.evaluate((element) => element === document.activeElement)); step += 1) await page.keyboard.press("Tab");
  await expect(run).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator('section[aria-live="polite"][tabindex="-1"]')).toBeFocused();
  expect(runtimeErrors).toEqual([]);
});
