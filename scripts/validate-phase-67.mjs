import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
for (const file of ["tests/e2e/large-dataset.spec.js", "docs/project/cycle-067-phase-67.md"]) {
  if (!existsSync(join(root, file))) throw new Error(`Evidência da Fase 67 ausente: ${file}.`);
}
const productService = read("js/services/product-service.js");
if (!productService.includes("paginateProducts") || !productService.includes("searchPage")) throw new Error("Busca paginada de produtos ausente.");
const view = read("js/views/product-view.js");
for (const contract of ["searchPage", "product-pagination", "paginationLabel", "resultsSummary"]) if (!view.includes(contract)) throw new Error(`Lista extensa sem contrato: ${contract}.`);
for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = read(`locales/${locale}.json`);
  for (const key of ["resultsSummary", "paginationLabel", "previousPage", "nextPage", "pageStatus"]) if (!catalog.includes(`"${key}"`)) throw new Error(`Copy da paginação ausente em ${locale}: ${key}.`);
}
if (!/APROVADO/u.test(read("docs/project/cycle-067-phase-67.md"))) throw new Error("Gate da Fase 67 não foi registrado.");
process.stdout.write("Fase 67: busca, filtros e catálogo paginado permanecem utilizáveis em conjunto extenso.\n");
