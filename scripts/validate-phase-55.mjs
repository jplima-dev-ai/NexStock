import { readFileSync } from "node:fs";

const service = readFileSync("js/services/scenario-service.js", "utf8");
const view = readFileSync("js/views/scenario-view.js", "utf8");
for (const token of ["createDigitalTwin", "applyTwinScenario", "inventory-digital-twin", "immutableRecords", "persisted: false"]) {
  if (!service.includes(token)) throw new Error(`Fase 55 sem Twin isolado: ${token}`);
}
for (const forbidden of ["provider.put", "provider.bulkPut", "applyStockMovement"]) {
  if (service.includes(forbidden)) throw new Error(`Fase 55 contém persistência proibida: ${forbidden}`);
}
for (const token of ["createDigitalTwinView", "digitalTwinCore.noticeMessage", "applyTwinScenario", "digital-twin-product"]) {
  if (!view.includes(token)) throw new Error(`Fase 55 sem interface acessível do Twin: ${token}`);
}
process.stdout.write("Fase 55: Digital Twin permanece isolado do inventário real.\n");
