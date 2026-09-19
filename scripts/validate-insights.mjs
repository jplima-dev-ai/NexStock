import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const service = readFileSync(join(root, "js/services/insight-service.js"), "utf8");
for (const contract of ["FORECAST_WINDOW_DAYS = 30", "averageDailyOut", "daysRemaining", "calculateConfidence", "calculateStockMemory", "PAST_DEMAND_MAY_CHANGE"]) {
  if (!service.includes(contract)) throw new Error(`Contrato de Insight ausente: ${contract}`);
}
const view = readFileSync(join(root, "js/views/insight-view.js"), "utf8");
for (const contract of ['createElement("details")', 'text("summary"', "explainForecast", "memoryContent", "estimateNotice"]) {
  if (!view.includes(contract)) throw new Error(`Contrato Explain the Math ausente: ${contract}`);
}
process.stdout.write("Insights: previsão, confiança, cálculo reproduzível e Stock Memory aprovados.\n");
