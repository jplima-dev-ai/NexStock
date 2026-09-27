import { DATABASE_VERSION } from "../storage/migrations/index.js";

export function getMigrationCertificate({ currentVersion = DATABASE_VERSION, storedVersion = DATABASE_VERSION } = {}) {
  const current = Number(currentVersion);
  const stored = Number(storedVersion);
  return Object.freeze({
    currentVersion: current,
    storedVersion: stored,
    status: stored > current ? "needsAttention" : stored === current ? "current" : "upgradeReady",
    policy: "additiveOnly",
  });
}
