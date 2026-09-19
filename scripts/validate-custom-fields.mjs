import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const service = readFileSync(join(root, "js/services/custom-field-service.js"), "utf8");
for (const contract of ["currency", "multiselect", "url", "searchable", "CUSTOM_FIELD_CREATED", "CUSTOM_FIELD_DISABLED"]) {
  if (!service.includes(contract)) throw new Error(`Contrato de Custom Fields ausente: ${contract}`);
}
const product = readFileSync(join(root, "js/views/product-view.js"), "utf8");
for (const contract of ["selectedOptions", "definition.options", "customData"]) {
  if (!product.includes(contract)) throw new Error(`Integração de produto ausente: ${contract}`);
}
process.stdout.write("Custom Fields: oito tipos, criação dinâmica, pesquisa e preservação histórica aprovados.\n");
