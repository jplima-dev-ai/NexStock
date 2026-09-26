import { test, expect } from "@playwright/test";
import { appRoute, monitorRuntimeErrors } from "./helpers.js";

test("smoke: shell e rotas centrais abrem em Chromium sem erro fatal", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const routes = [
    ["/welcome", "Boas-vindas"],
    ["/tour", "Visita guiada"],
    ["/onboarding", "Configuração inicial"],
    ["/dashboard", "Painel"],
    ["/products", "Produtos"],
    ["/movements", "Movimentações"],
    ["/insights", "Insights"],
    ["/scenario", "Scenario Lab"],
    ["/time-machine", "Time Machine"],
    ["/settings", "Configurações"],
  ];

  for (const [route, title] of routes) {
    await page.goto(appRoute(route));
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText(title);
    await expect(heading).toBeFocused();
  }

  expect(runtimeErrors).toEqual([]);
});
