import { readFileSync } from "node:fs";

const service = readFileSync("js/services/movement-service.js", "utf8");
const view = readFileSync("js/views/movement-view.js", "utf8");
for (const token of ["buildConsequencePreview", "before", "after", "quantityDelta", "persisted: false"]) {
  if (!service.includes(token)) throw new Error(`Fase 56 sem consequência antes/depois: ${token}`);
}
for (const token of ["consequencePreview.title", "consequencePreview.before", "consequencePreview.after", "consequencePreview.impact"]) {
  if (!view.includes(token)) throw new Error(`Fase 56 sem apresentação compreensível: ${token}`);
}
process.stdout.write("Fase 56: ações importantes exibem antes/depois quando aplicável.\n");
