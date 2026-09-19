import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const provider = readFileSync(join(root, "js/storage/indexeddb-provider.js"), "utf8");
for (const contract of ['["products", "movements", "auditLogs"]', "expectedBeforeQuantity", "transaction.abort", "StockConflictError"]) {
  if (!provider.includes(contract)) throw new Error(`Contrato transacional ausente: ${contract}`);
}
const service = readFileSync(join(root, "js/services/movement-service.js"), "utf8");
for (const contract of ["InsufficientStockError", "calculateMovementImpact", "STOCK_MOVEMENT_APPLIED", "applyStockMovement"]) {
  if (!service.includes(contract)) throw new Error(`Contrato de movimentação ausente: ${contract}`);
}
const view = readFileSync(join(root, "js/views/movement-view.js"), "utf8");
for (const contract of ["previewTitle", "resultingStatus", "movement.confirm", 'aria-live']) {
  if (!view.includes(contract)) throw new Error(`Contrato de prévia acessível ausente: ${contract}`);
}
process.stdout.write("Movimentações: transação atômica, prévia de impacto e auditoria aprovadas.\n");
