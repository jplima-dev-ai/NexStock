import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DATA_STORES } from "../js/storage/data-provider.js";
import { DATABASE_NAME } from "../js/storage/indexeddb-provider.js";
import { STORE_DEFINITIONS } from "../js/storage/migrations/001-initial-schema.js";
import { DEMO_PROFILES, validateDemoSeed } from "../js/services/seed-loader.js";

const ROOT = process.cwd();
if (DATABASE_NAME !== "nexstock-db") throw new Error("Nome do IndexedDB divergente do blueprint.");
if (JSON.stringify(Object.keys(STORE_DEFINITIONS)) !== JSON.stringify(DATA_STORES)) {
  throw new Error("Stores da migração não correspondem ao contrato DataProvider.");
}

for (const profile of DEMO_PROFILES) {
  const seed = JSON.parse(readFileSync(join(ROOT, "demo", `${profile}.json`), "utf8"));
  validateDemoSeed(seed, profile);
}

const technology = JSON.parse(readFileSync(join(ROOT, "demo/technology.json"), "utf8"));
const requiredProducts = ["Orion Notebook", "Quantum SSD", "NovaMesh Router", "Orbit Keyboard", "Pulse Headset"];
for (const product of requiredProducts) {
  if (!technology.products.some(({ name }) => name === product)) throw new Error(`Seed tecnológico ausente: ${product}`);
}

const migrationSource = readFileSync(join(ROOT, "js/storage/migrations/001-initial-schema.js"), "utf8");
for (const forbidden of ["deleteObjectStore", "deleteDatabase", ".clear("]) {
  if (migrationSource.includes(forbidden)) throw new Error(`Migração destrutiva detectada: ${forbidden}`);
}

process.stdout.write(`Persistência: ${DATA_STORES.length} stores, migração aditiva e ${DEMO_PROFILES.length} seeds aprovados.\n`);
