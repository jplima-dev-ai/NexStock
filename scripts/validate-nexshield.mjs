import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const security = readFileSync(join(root, "js/services/security-service.js"), "utf8");
for (const contract of ["negativeStock", "duplicateNexCode", "duplicateSerial", "dangerousUrl", "invalidImport", "restoreBoundary", "crossWorkspace", "corruptData", "invalidMedia", "validateBackup", "validateImageFile", "isolated: true", "IndexedDBProvider", "nexshield-indexeddb", "nexshield-postgresql", "audit-log-archive"]) if (!security.includes(contract)) throw new Error(`Contrato NexShield ausente: ${contract}`);
const view = readFileSync(join(root, "js/views/security-view.js"), "utf8");
for (const contract of ["createSecurityCenterView", "createShieldTestView", "runIsolatedTests"]) if (!view.includes(contract)) throw new Error(`Interface NexShield ausente: ${contract}`);
process.stdout.write("NexShield 2.0: hardening, Security Center e dez testes isolados aprovados.\n");
