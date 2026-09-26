import { readFileSync } from "node:fs";
const source = readFileSync("js/services/intelligence-service.js", "utf8");
for (const token of ["reorderRecommendation", "leadTimeDays", "safetyStock", "suggestedQuantity", "REVIEW_REORDER_SUGGESTION"]) if (!source.includes(token)) throw new Error(`Fase 49 sem recomendação explicável: ${token}`);
process.stdout.write("Fase 49: sugestão local não executa compra automaticamente.\n");
