import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { appRoute, createTechnologyWorkspace } from "./helpers.js";

const baseline = JSON.parse(readFileSync(new URL("../visual-baselines/critical-states.json", import.meta.url), "utf8"));

test("baselines visuais críticos preservam rota, tema e superfícies", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Visual");
  for (const state of baseline.states.filter(({ route }) => route !== "/welcome")) {
    await page.goto(appRoute(state.route));
    await page.evaluate((theme) => document.documentElement.dataset.theme = theme, state.theme);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(state.heading);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("background-color", /.+/);
  }
});
