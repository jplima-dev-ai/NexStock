import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const workflowPath = join(process.cwd(), ".github/workflows/pages.yml");
if (!existsSync(workflowPath)) throw new Error("Workflow do GitHub Pages ausente.");
const workflow = readFileSync(workflowPath, "utf8");
for (const contract of [
  "actions/checkout@v6",
  "actions/setup-node@v6",
  "actions/configure-pages@v5",
  "actions/upload-pages-artifact@v4",
  "actions/deploy-pages@v4",
  "pages: write",
  "id-token: write",
  "environment:",
  "name: github-pages",
  "needs: build",
  "npm run validate",
  "npm run build:pages",
  "npm run validate:pages",
]) {
  if (!workflow.includes(contract)) throw new Error(`Contrato ausente no workflow: ${contract}`);
}
if (!/path:\s*_site/u.test(workflow)) throw new Error("Workflow não publica exclusivamente o artefato _site.");

process.stdout.write("GitHub Actions: CI, artefato e deploy do Pages aprovados.\n");
