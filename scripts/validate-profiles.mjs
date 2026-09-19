import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NEX_PROFILES, PROFILE_KEYS } from "../js/profiles/profile-registry.js";

const ROOT = process.cwd();
const expectedProfiles = ["technology", "cosmetics", "fashion", "food", "custom"];
if (JSON.stringify(PROFILE_KEYS) !== JSON.stringify(expectedProfiles)) {
  throw new Error("Registro NexProfiles divergente do blueprint.");
}

const signatures = new Set(PROFILE_KEYS.map((key) => JSON.stringify({
  modules: NEX_PROFILES[key].modules,
  fields: NEX_PROFILES[key].fields.map((field) => field.key),
})));
if (signatures.size < 3) throw new Error("Perfis não apresentam adaptação suficiente de módulos e campos.");

const onboarding = readFileSync(join(ROOT, "js/views/onboarding-view.js"), "utf8");
for (const contract of [
  'createBrandLockup({ variant: "stacked"',
  'createBrandImage("mascot"',
  'createBrandImage("symbol"',
  'fieldset.className = "profile-options"',
  'section.setAttribute("aria-busy", "true")',
]) {
  if (!onboarding.includes(contract)) throw new Error(`Contrato do onboarding ausente: ${contract}`);
}

process.stdout.write(`NexProfiles: ${PROFILE_KEYS.length} perfis adaptativos e onboarding em quatro etapas aprovados.\n`);
