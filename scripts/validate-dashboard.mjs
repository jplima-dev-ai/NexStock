import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const service = readFileSync(join(root, "js/services/dashboard-service.js"), "utf8");
for (const contract of ["PULSE_WEIGHTS", "availability", "minimumCompliance", "freshness", "isStoppedProduct", "forecastCoverage"]) {
  if (!service.includes(contract)) throw new Error(`Contrato NexPulse ausente: ${contract}`);
}
const view = readFileSync(join(root, "js/views/dashboard-view.js"), "utf8");
for (const contract of ["pulseNarrative", "dashboard-priorities", "createMetricCard", "recentMovementTable", "createRadarView"]) {
  if (!view.includes(contract)) throw new Error(`Contrato do Dashboard ausente: ${contract}`);
}
if (view.includes("<canvas") || view.includes("createElement(\"canvas\")")) throw new Error("Dashboard não deve depender de gráficos.");
process.stdout.write("Dashboard: NexPulse, Radar, prioridades e leitura textual aprovados.\n");
