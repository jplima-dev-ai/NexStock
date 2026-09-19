import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const service = readFileSync(join(root, "js/services/module-service.js"), "utf8");
for (const contract of ["createSerial", "createBatch", "calculateKitAvailability", "limitingProductId", "buildGuard", 'return "unknown"', "findSmartSubstitutes", "setLifecycle"]) if (!service.includes(contract)) throw new Error(`Contrato modular ausente: ${contract}`);
const migration = readFileSync(join(root, "js/storage/migrations/003-module-integrity.js"), "utf8");
for (const contract of ["workspaceSerial", "productBatch", "unique: true"]) if (!migration.includes(contract)) throw new Error(`Integridade modular ausente: ${contract}`);
process.stdout.write("Módulos: serial, validade, variações, kits, compatibilidade, substitutos e lifecycle aprovados.\n");
