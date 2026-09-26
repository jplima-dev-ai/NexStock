import { readFileSync } from "node:fs";
const view = readFileSync("js/views/dashboard-view.js", "utf8");
for (const token of ["createActionCenter", "createPulse(snapshot, t), createActionCenter", "createInventoryStory(snapshot, t)", "recent, insights"]) if (!view.includes(token)) throw new Error(`Fase 51 sem leitura linear do painel: ${token}`);
process.stdout.write("Fase 51: situação e prioridades compreensíveis sem gráficos.\n");
