import { test, expect } from "@playwright/test";
import { appRoute, createTechnologyWorkspace, monitorRuntimeErrors } from "./helpers.js";

test("cada seção do NexSettings aceita link direto e preserva a seção após reload", async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page);
  const sections = [
    ["/settings", "Resumo"],
    ["/settings/general", "Geral"],
    ["/settings/appearance", "Aparência"],
    ["/settings/inventory", "Estoque"],
    ["/settings/profiles", "Perfis"],
    ["/settings/data", "Dados"],
    ["/settings/security", "Segurança"],
    ["/settings/pwa", "PWA"],
    ["/settings/advanced", "Avançado"],
  ];

  for (const [route, title] of sections) {
    await page.goto(appRoute(route));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Configurações");
    await expect(page.getByRole("heading", { level: 2, name: title, exact: true })).toBeVisible();
    await expect(page.locator(`.settings-nav a[href="#${route}"]`)).toHaveAttribute("aria-current", "page");
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`#${route.replaceAll("/", "\\/")}$`));
    await expect(page.getByRole("heading", { level: 2, name: title, exact: true })).toBeVisible();
  }
  expect(runtimeErrors).toEqual([]);
});

test("seletor móvel navega entre seções sem perder o contexto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appRoute("/settings"));
  const picker = page.getByLabel("Escolha uma seção das configurações");
  await expect(picker).toBeVisible();
  await picker.selectOption("/settings/appearance");
  await expect(page).toHaveURL(/#\/settings\/appearance$/);
  await expect(page.getByRole("heading", { level: 2, name: "Aparência", exact: true })).toBeVisible();
  await page.reload();
  await expect(picker).toHaveValue("/settings/appearance");
});

test("resumo torna estados centrais encontráveis por atalhos", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Resumo");
  await page.goto(appRoute("/settings"));
  for (const title of ["Espaço de trabalho", "Aparência e experiência", "Dados locais", "Segurança", "Aplicativo e conexão"]) {
    await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
  }
  await expect(page.getByText("Estoque Resumo", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Abrir Aparência" }).click();
  await expect(page).toHaveURL(/#\/settings\/appearance$/);
});

test("preferências seguras salvam imediatamente e reset exige confirmação", async ({ page }) => {
  await createTechnologyWorkspace(page, "Estoque Preferências");
  await page.goto(appRoute("/settings/general"));
  const name = page.getByLabel("Nome do espaço de trabalho");
  await name.fill("Estoque Atualizado");
  await name.press("Tab");
  await expect(page.locator(".settings-form [role=status]")).toHaveText("Alteração salva neste dispositivo.");

  await page.goto(appRoute("/settings/appearance"));
  await page.getByLabel("Tema", { exact: true }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByLabel("Modo de experiência").selectOption("compact");
  await expect(page.locator(".settings-form [role=status]")).toHaveText("Alteração salva neste dispositivo.");
  await page.reload();
  await expect(page.getByLabel("Tema", { exact: true })).toHaveValue("dark");
  await expect(page.getByLabel("Modo de experiência")).toHaveValue("compact");

  await page.goto(appRoute("/settings/data"));
  const reset = page.getByRole("button", { name: "Restaurar espaço de trabalho" });
  await reset.click();
  await expect(page.getByText("Produtos, movimentações e histórico deste espaço serão substituídos pelos dados iniciais de demonstração. Esta ação não pode ser desfeita.")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(reset).toBeFocused();

  await page.goto(appRoute("/settings"));
  await expect(page.getByText("Estoque Atualizado", { exact: true })).toBeVisible();
  await expect(page.getByText("Escuro", { exact: true })).toBeVisible();
  await expect(page.getByText("Compacto", { exact: true })).toBeVisible();
});
