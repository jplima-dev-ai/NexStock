import { readFileSync } from "node:fs";
const source = readFileSync("js/services/insight-service.js", "utf8");
const view = readFileSync("js/views/insight-view.js", "utf8");
if (!source.includes("dataSufficiency") || !view.includes("forecast.dataSufficiency")) throw new Error("Fase 47 não distingue confiança de insuficiência de dados.");
process.stdout.write("Fase 47: confiança e insuficiência de dados são distintas.\n");
