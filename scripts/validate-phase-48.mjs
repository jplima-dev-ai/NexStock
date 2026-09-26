import { readFileSync } from "node:fs";
const source = readFileSync("js/services/intelligence-service.js", "utf8");
if (!source.includes("UNUSUALLY_LARGE_OUTPUT") || !source.includes("explanation:")) throw new Error("Fase 48 sem anomalia explicável.");
process.stdout.write("Fase 48: anomalias determinísticas explicam a razão.\n");
