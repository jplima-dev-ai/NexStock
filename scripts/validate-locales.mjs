import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const locales = ["pt-BR", "en-US", "es"];
const expectedSlogans = Object.freeze({
  "pt-BR": "Seu estoque, explicado de um jeito simples.",
  "en-US": "Your inventory, explained simply.",
  es: "Tu inventario, explicado de forma sencilla.",
});

function flattenCatalog(value, prefix = "", result = new Map()) {
  for (const [key, entry] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      flattenCatalog(entry, path, result);
    } else {
      result.set(path, entry);
    }
  }
  return result;
}

function placeholders(message) {
  return [...message.matchAll(/\{([a-zA-Z][\w]*)\}/gu)].map((match) => match[1]).sort();
}

function javascriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? javascriptFiles(path) : (entry.name.endsWith(".js") ? [path] : []);
  });
}

const catalogs = new Map(locales.map((locale) => {
  const file = join(ROOT, "locales", `${locale}.json`);
  return [locale, JSON.parse(readFileSync(file, "utf8"))];
}));
const referenceKeys = [...flattenCatalog(catalogs.get("pt-BR")).keys()].sort();
const referenceCatalog = flattenCatalog(catalogs.get("pt-BR"));

for (const locale of locales) {
  const catalog = catalogs.get(locale);
  const flat = flattenCatalog(catalog);
  const keys = [...flat.keys()].sort();
  if (JSON.stringify(keys) !== JSON.stringify(referenceKeys)) {
    const missing = referenceKeys.filter((key) => !flat.has(key));
    const extra = keys.filter((key) => !referenceKeys.includes(key));
    throw new Error(`${locale}: chaves divergentes; ausentes=${missing.join(",")}; extras=${extra.join(",")}`);
  }
  for (const [key, message] of flat) {
    if (typeof message !== "string" || message.trim() === "") {
      throw new TypeError(`${locale}: mensagem inválida em ${key}.`);
    }
    if (/<\/?[a-z][^>]*>/iu.test(message)) {
      throw new Error(`${locale}: HTML não permitido em ${key}.`);
    }
    const expectedParameters = placeholders(referenceCatalog.get(key));
    const actualParameters = placeholders(message);
    if (JSON.stringify(actualParameters) !== JSON.stringify(expectedParameters)) {
      throw new Error(`${locale}: parâmetros divergentes em ${key}; esperado=${expectedParameters.join(",")}; recebido=${actualParameters.join(",")}`);
    }
  }
  if (catalog.app.slogan !== expectedSlogans[locale]) {
    throw new Error(`${locale}: slogan oficial divergente.`);
  }
}

const sourceKeys = new Set();
for (const file of javascriptFiles(join(ROOT, "js"))) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/(?:i18n\.)?t\(["']([a-z][\w-]*(?:\.[\w:-]+)+)["']/gu)) {
    sourceKeys.add(match[1]);
  }
}
const html = readFileSync(join(ROOT, "index.html"), "utf8");
for (const match of html.matchAll(/data-i18n=["']([\w.-]+)["']/gu)) sourceKeys.add(match[1]);
for (const key of sourceKeys) {
  if (!referenceCatalog.has(key)) throw new Error(`Chave usada no código e ausente nos catálogos: ${key}`);
}

const router = readFileSync(join(ROOT, "js/core/router.js"), "utf8");
for (const match of router.matchAll(/messageKey:\s*["']([\w]+)["']/gu)) {
  for (const suffix of ["title", "description"]) {
    const key = `routes.${match[1]}.${suffix}`;
    if (!referenceCatalog.has(key)) throw new Error(`Rota sem tradução completa: ${key}`);
  }
}

const requiredFlowGroups = [
  "app", "pwa", "onboarding", "productCore", "dashboardCore", "inventoryStory",
  "scenarioCore", "timeMachineCore", "insightCore", "movement", "commandPalette",
  "securityCenter", "shieldTest", "errors", "routes",
];
for (const locale of locales) {
  const catalog = catalogs.get(locale);
  for (const group of requiredFlowGroups) {
    if (!catalog[group]) throw new Error(`${locale}: fluxo principal sem o grupo ${group}.`);
  }
}

const obsoleteCopy = /blueprint|fase prevista|fase de perfis|future phase|phase defined|profiles and persistence phase|em desenvolvimento|in development|en desarrollo/iu;
for (const [locale, catalog] of catalogs) {
  for (const [key, message] of flattenCatalog(catalog)) {
    if (obsoleteCopy.test(message)) throw new Error(`${locale}: copy obsoleta em ${key}.`);
  }
}

for (const [key, message] of flattenCatalog(catalogs.get("pt-BR"))) {
  const visibleMessage = message.replaceAll(/\{[a-zA-Z][\w]*\}/gu, "");
  if (/\bworkspace\b/iu.test(visibleMessage)) throw new Error(`pt-BR: termo não traduzido em ${key}.`);
}

const routeView = readFileSync(join(ROOT, "js/views/route-view.js"), "utf8");
if (!routeView.includes('locale === "pt-BR"') || !routeView.includes('return "hero"')) {
  throw new Error("A Brand Scene precisa estar limitada ao locale pt-BR.");
}

const app = readFileSync(join(ROOT, "js/app.js"), "utf8");
for (const contract of [
  'router.refresh({ moveFocus: false })',
  "localeSelect.focus()",
  "document.documentElement.lang = i18n.locale",
]) {
  if (!app.includes(contract)) throw new Error(`Contrato de troca de idioma ausente: ${contract}`);
}

process.stdout.write(`Internacionalização: ${referenceKeys.length} mensagens equivalentes em ${locales.length} idiomas.\n`);
