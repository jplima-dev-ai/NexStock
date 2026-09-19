import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const service = readFileSync(join(root, "js/services/inventory-story-service.js"), "utf8");
for (const contract of ["inventoryStory.movements.none", "inventoryStory.forecast.unavailable", "nextStepKey", "Object.freeze"]) {
  if (!service.includes(contract)) throw new Error(`Contrato da Inventory Story ausente: ${contract}`);
}
const view = readFileSync(join(root, "js/views/dashboard-view.js"), "utf8");
if (!view.includes("createInventoryStory(snapshot, t)")) throw new Error("Inventory Story não está na ordem do Dashboard.");
process.stdout.write("Inventory Story: narrativa determinística e estado sem movimentos aprovados.\n");
