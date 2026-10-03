import { spawnSync } from "node:child_process";

const scripts = [
  "validate-static.mjs",
  ...Array.from({ length: 54 }, (_, index) => `validate-phase-${index + 25}.mjs`),
  "validate-v1.2-release.mjs",
  "validate-brand-assets.mjs", "validate-design-system.mjs", "validate-locales.mjs", "validate-copy.mjs",
  "validate-storage.mjs", "validate-profiles.mjs", "validate-product-core.mjs", "validate-movements.mjs",
  "validate-dashboard.mjs", "validate-insights.mjs", "validate-inventory-story.mjs", "validate-custom-fields.mjs",
  "validate-modules.mjs", "validate-command-palette.mjs", "validate-nexshield.mjs", "validate-pwa.mjs",
  "validate-responsive.mjs", "validate-database.mjs", "validate-portfolio.mjs", "validate-v1-release.mjs", "validate-release.mjs",
];

for (const script of scripts) {
  const result = spawnSync(process.execPath, [`scripts/${script}`], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
