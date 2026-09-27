import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
const service = read("js/services/privacy-data-center-service.js");
const view = read("js/views/privacy-data-center-view.js");
const router = read("js/core/router.js");
const worker = read("service-worker.js");
const tests = read("tests/unit/privacy-data-center-service.test.js");
const cycle = read("docs/project/cycle-061-phase-61.md");
for (const contract of ["browserIndexedDb", "remoteProvider", "manualNexBackup", "notConfigured", "providerConfigured"]) if (!service.includes(contract)) throw new Error(`Contrato Privacy & Data Center ausente: ${contract}`);
for (const contract of ["createElement(\"dl\")", "privacyDataCenter.honestMessage", "#/settings/data/backup", "#/settings/data/snapshots"]) if (!view.includes(contract)) throw new Error(`Interface Privacy & Data Center ausente: ${contract}`);
for (const locale of ["pt-BR", "en-US", "es"]) if (!read(`locales/${locale}.json`).includes('"privacyDataCenter"')) throw new Error(`Copy Privacy & Data Center ausente em ${locale}.`);
for (const contract of ["/settings/data/privacy", "privacyDataCenter"]) if (!router.includes(contract)) throw new Error("Rota Privacy & Data Center ausente.");
for (const contract of ["privacy-data-center-service.js", "privacy-data-center-view.js"]) if (!worker.includes(contract)) throw new Error(`PWA não pré-cacheia ${contract}.`);
if (!tests.includes("sem reter URL ou chave") || !/localização dos dados é compreensível/u.test(cycle)) throw new Error("Evidência de privacidade ou gate da Fase 61 ausente.");
process.stdout.write("Fase 61: localização dos dados é compreensível sem expor configuração.\n");
