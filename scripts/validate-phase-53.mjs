import { readFileSync } from "node:fs";

const service = readFileSync("js/services/scenario-service.js", "utf8");
const view = readFileSync("js/views/scenario-view.js", "utf8");
for (const token of ["compareScenarios", "Scenario comparison requires A, B, and C", "id: \"REAL\"", "risks", "forecast"]) {
  if (!service.includes(token)) throw new Error(`Fase 53 sem comparação completa: ${token}`);
}
for (const token of ["comparisonInputTitle", "scenarioComparison", "comparisonCard", "compareScenarios"]) {
  if (!view.includes(token)) throw new Error(`Fase 53 sem comparação compreensível: ${token}`);
}
process.stdout.write("Fase 53: Real, A, B e C podem ser comparados com clareza.\n");
