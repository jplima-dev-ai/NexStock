import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const service = readFileSync(join(root, "js/services/scenario-service.js"), "utf8");
for (const contract of ["saida", "entrada", "alterar_estoque_minimo", "aumentar_ritmo_de_saida", "persisted: false"]) {
  if (!service.includes(contract)) throw new Error(`Contrato de cenário ausente: ${contract}`);
}
for (const forbidden of ["provider.put", "provider.bulkPut", "applyStockMovement"]) {
  if (service.includes(forbidden)) throw new Error(`Simulação contém persistência proibida: ${forbidden}`);
}
const view = readFileSync(join(root, "js/views/scenario-view.js"), "utf8");
for (const contract of ["timeMachineCore.past", "timeMachineCore.present", "timeMachineCore.future", "scenarioCore.notSavedMessage"]) {
  if (!view.includes(contract)) throw new Error(`Contrato visual ausente: ${contract}`);
}
process.stdout.write("Scenario Lab e Time Machine: simulação não persistente e passado/presente/futuro aprovados.\n");
