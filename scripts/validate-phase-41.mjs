import { existsSync, readFileSync } from "node:fs"; import { join } from "node:path";
const root = process.cwd(); for (const file of ["js/services/label-service.js", "js/views/labels-view.js", "tests/unit/label-service.test.js", "tests/e2e/labels.spec.js", "docs/project/cycle-041-phase-41.md"]) if (!existsSync(join(root, file))) throw new Error(`Fase 41 sem artefato obrigatório: ${file}`);
for (const token of ["LabelService", "buildLabelCode", "NXL|"]) if (!readFileSync(join(root, "js/services/label-service.js"), "utf8").includes(token)) throw new Error(`Contrato NexLabels ausente: ${token}`);
for (const locale of ["pt-BR", "en-US", "es"]) if (!JSON.parse(readFileSync(join(root, "locales", `${locale}.json`), "utf8")).labels?.generate) throw new Error(`${locale}: textos NexLabels ausentes.`);
for (const token of ["label-service.js", "labels-view.js"]) if (!readFileSync(join(root, "service-worker.js"), "utf8").includes(token)) throw new Error(`Cache NexLabels ausente: ${token}`);
if (!/phase(?:41|[4-9][0-9])/u.test(readFileSync(join(root, "service-worker.js"), "utf8"))) throw new Error("Cache NexLabels não preserva a evolução posterior à fase 41.");
process.stdout.write("Fase 41: etiquetas locais e código resolvido pelo NexScan aprovados.\n");
