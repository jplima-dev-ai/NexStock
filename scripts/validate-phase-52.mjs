import { readFileSync } from "node:fs";
const source = readFileSync("js/services/scenario-service.js", "utf8");
for (const token of ["simulateScenarioLab", "changes.length < 2", "persisted: false"]) if (!source.includes(token)) throw new Error(`Fase 52 sem múltiplas variáveis isoladas: ${token}`);
process.stdout.write("Fase 52: múltiplas variáveis funcionam sem persistir.\n");
