import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const TEMP = mkdtempSync(join(tmpdir(), "nexstock-clean-clone-"));
const SOURCE = join(TEMP, "source");
const CLONE = join(TEMP, "clone");

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) throw new Error(`Falha ao executar: ${command} ${args.join(" ")}`);
}

try {
  cpSync(ROOT, SOURCE, {
    recursive: true,
    filter: (source) => {
      const name = basename(source);
      return ![".git", "_site", "node_modules", "NexStock.zip"].includes(name) && !name.startsWith("NexStock-v");
    },
  });
  run("git", ["init", "--initial-branch=main"], SOURCE);
  run("git", ["add", "."], SOURCE);
  run("git", ["-c", "user.name=NexStock QA", "-c", "user.email=qa@nexstock.invalid", "commit", "-m", "clean snapshot"], SOURCE);
  run("git", ["clone", "--quiet", SOURCE, CLONE], TEMP);
  run("npm", ["run", "validate", "--silent"], CLONE);
  run("npm", ["run", "build:pages", "--silent"], CLONE);
  run("npm", ["run", "validate:pages", "--silent"], CLONE);
  process.stdout.write("Clone limpo: validação e build do GitHub Pages reproduzidos com sucesso.\n");
} finally {
  if (basename(TEMP).startsWith("nexstock-clean-clone-")) rmSync(TEMP, { recursive: true, force: true });
}
