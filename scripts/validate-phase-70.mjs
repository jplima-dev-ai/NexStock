import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
const locales = ["pt-BR", "en-US", "es"];

for (const file of ["scripts/validate-locales.mjs", "scripts/validate-copy.mjs", "tests/e2e/copy-audit.spec.js", "docs/project/cycle-070-phase-70.md"]) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 70 ausente: ${file}.`);
}

const criticalCopy = {
  "pt-BR": {
    "app.languageLabel": "Idioma",
    "productCore.newProduct": "Novo produto",
    "productCore.minimum": "Estoque mínimo",
    "movement.moveProduct": "Movimentar estoque",
  },
  "en-US": {
    "app.languageLabel": "Language",
    "productCore.newProduct": "New product",
    "productCore.minimum": "Minimum stock",
    "movement.moveProduct": "Move inventory",
  },
  es: {
    "app.languageLabel": "Idioma",
    "productCore.newProduct": "Producto nuevo",
    "productCore.minimum": "Existencias mínimas",
    "movement.moveProduct": "Mover inventario",
  },
};

for (const locale of locales) {
  const catalog = JSON.parse(read(`locales/${locale}.json`));
  for (const [path, expected] of Object.entries(criticalCopy[locale])) {
    const actual = path.split(".").reduce((value, key) => value?.[key], catalog);
    if (actual !== expected) throw new Error(`${locale}: terminologia crítica divergente em ${path}.`);
  }
}

if (!/APROVADO/u.test(read("docs/project/cycle-070-phase-70.md"))) throw new Error("Gate da Fase 70 não foi registrado.");
process.stdout.write("Fase 70: terminologia crítica consistente em pt-BR, en-US e es.\n");
