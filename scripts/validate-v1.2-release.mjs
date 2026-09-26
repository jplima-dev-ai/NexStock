import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const read = (file) => readFileSync(join(ROOT, file), "utf8");
for (const file of ["docs/releases/v1.2.0.md", "docs/project/cycle-033-phase-33.md", "docs/project/cycle-034-phase-34.md", "docs/project/cycle-035-phase-35.md", "docs/project/cycle-036-phase-36.md"]) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Release 1.2 sem evidência: ${file}`);
}
const [major, minor] = JSON.parse(read("package.json")).version.split(".").map(Number);
if (major !== 1 || minor < 2) throw new Error("A release Data Mobility exige a linha de versão 1.2.0 ou posterior.");
const release = read("docs/releases/v1.2.0.md");
for (const capability of ["Import Center", "Export Center", "NexBackup", "snapshots", "Integridade"]) {
  if (!release.includes(capability)) throw new Error(`Release 1.2 sem capacidade: ${capability}`);
}
process.stdout.write("Release v1.2.0: Import, Export, NexBackup e Snapshots com integridade verificável.\n");
