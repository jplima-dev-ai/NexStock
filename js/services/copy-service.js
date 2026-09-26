const EXPERIENCE_MODES = new Set(["guided", "compact"]);
const PROFILE_KEYS = new Set(["technology", "cosmetics", "fashion", "food", "custom"]);

export function normalizeExperienceMode(mode = "guided") {
  return EXPERIENCE_MODES.has(mode) ? mode : "guided";
}

export function normalizeCopyProfile(profileKey = "custom") {
  return PROFILE_KEYS.has(profileKey) ? profileKey : "custom";
}

export function createCopyContext({ translate, workspace } = {}) {
  if (typeof translate !== "function") throw new TypeError("Copy context requires a translate function.");
  const mode = normalizeExperienceMode(workspace?.experienceMode);
  const profileKey = normalizeCopyProfile(workspace?.profileKey);

  return Object.freeze({
    mode,
    profileKey,
    isGuided: mode === "guided",
    field({ helpKey, exampleKey, profileExample } = {}) {
      if (!helpKey) throw new TypeError("Contextual field copy requires a help key.");
      const resolvedExampleKey = profileExample
        ? `nexCopy.profileExamples.${profileKey}.${profileExample}`
        : exampleKey;
      return Object.freeze({
        helpText: translate(helpKey),
        exampleText: mode === "guided" && resolvedExampleKey ? translate(resolvedExampleKey) : "",
      });
    },
    explanation(key, parameters) {
      return mode === "guided" ? translate(key, parameters) : "";
    },
    modeMessage() {
      return translate(`nexCopy.mode.${mode}`);
    },
  });
}
