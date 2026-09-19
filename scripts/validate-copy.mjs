import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogs = Object.fromEntries(["pt-BR", "en-US", "es"].map((locale) => [locale, JSON.parse(readFileSync(join(root, "locales", `${locale}.json`), "utf8"))]));

function flatten(value, prefix = "", result = []) {
  for (const [key, entry] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === "object" && !Array.isArray(entry)) flatten(entry, path, result);
    else result.push([path, entry]);
  }
  return result;
}

const expectedRouteTitles = {
  "pt-BR": { insights: "Insights", profiles: "Campos personalizados" },
  "en-US": { insights: "Insights", profiles: "Custom fields", movements: "Stock movements" },
  es: { insights: "Insights", profiles: "Campos personalizados" },
};
for (const [locale, routes] of Object.entries(expectedRouteTitles)) {
  for (const [route, title] of Object.entries(routes)) {
    if (catalogs[locale].routes[route].title !== title) throw new Error(`${locale}: título inconsistente na rota ${route}.`);
  }
}

const forbidden = {
  "pt-BR": /\b(?:seed|workspace)\b/iu,
  "en-US": /accessible registration|profile seed|calculated right now/iu,
  es: /\bBuscable\b|\bStock mínimo\b|mover el inventario|Información útil/iu,
};
for (const [locale, pattern] of Object.entries(forbidden)) {
  for (const [key, message] of flatten(catalogs[locale])) {
    const visible = String(message).replaceAll(/\{[a-zA-Z][\w]*\}/gu, "");
    if (pattern.test(visible)) throw new Error(`${locale}: copy inconsistente em ${key}: ${message}`);
  }
}

process.stdout.write("Copy: terminologia, títulos de rota e mensagens revisados nos três idiomas.\n");
