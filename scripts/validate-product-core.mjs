import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DATABASE_VERSION } from "../js/storage/migrations/index.js";

const ROOT = process.cwd();
if (DATABASE_VERSION < 2) throw new Error("Migração de unicidade do NexCode não está ativa.");
const service = readFileSync(join(ROOT, "js/services/product-service.js"), "utf8");
for (const contract of ["PRODUCT_CREATED", "PRODUCT_UPDATED", "PRODUCT_ARCHIVED", "normalizeSearchText", "workspaceId"]) {
  if (!service.includes(contract)) throw new Error(`Contrato do Core ausente: ${contract}`);
}
const view = readFileSync(join(ROOT, "js/views/product-view.js"), "utf8");
for (const contract of ["createTable", 'role", "search"', "clearFilters", "confirmArchive"]) {
  if (!view.includes(contract)) throw new Error(`Contrato de produto ausente: ${contract}`);
}
process.stdout.write("Core de produtos: NexCode, CRUD, busca, filtros e arquivamento aprovados.\n");
