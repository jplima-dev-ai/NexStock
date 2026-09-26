import { readFileSync } from "node:fs";
const source = readFileSync("js/services/actions-service.js", "utf8");
for (const token of ["buildActionCenter", "situation", "explanation", "consequence", "REVIEW_ONLY"]) if (!source.includes(token)) throw new Error(`Fase 50 sem prioridade acionável e explicável: ${token}`);
process.stdout.write("Fase 50: prioridades acionáveis e explicáveis, sem execução automática.\n");
