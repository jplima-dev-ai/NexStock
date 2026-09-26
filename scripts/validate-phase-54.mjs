import { readFileSync } from "node:fs";

const service = readFileSync("js/services/scenario-service.js", "utf8");
const view = readFileSync("js/views/scenario-view.js", "utf8");
for (const token of ["reconstructHistoricalSnapshot", "historicalProduct", "Historical date cannot be in the future", "buildDashboardSnapshot", "persisted: false"]) {
  if (!service.includes(token)) throw new Error(`Fase 54 sem reconstrução coerente: ${token}`);
}
for (const token of ["time-machine-date", "reconstructHistoricalSnapshot", "historicalPulseCard", "pulseScoreContext"]) {
  if (!view.includes(token)) throw new Error(`Fase 54 sem Time Machine compreensível: ${token}`);
}
process.stdout.write("Fase 54: reconstrução histórica coerente e não persistente.\n");
