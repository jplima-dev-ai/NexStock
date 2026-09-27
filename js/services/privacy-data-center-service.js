import { PROVIDER_TYPES } from "../storage/provider-factory.js";

export function getPrivacyDataCenterFacts({ providerType = PROVIDER_TYPES.INDEXED_DB, online = true } = {}) {
  const remoteProvider = providerType === PROVIDER_TYPES.SUPABASE;
  return Object.freeze({
    dataLocation: remoteProvider ? "remoteProvider" : "browserIndexedDb",
    provider: remoteProvider ? "supabase" : "indexeddb",
    backup: "manualNexBackup",
    snapshots: "activeProviderSnapshots",
    synchronization: remoteProvider ? "providerConfigured" : "notConfigured",
    connection: online ? "online" : "offline",
  });
}

export class PrivacyDataCenterService {
  constructor({ providerType, online = () => globalThis.navigator?.onLine !== false } = {}) {
    this.providerType = providerType;
    this.online = online;
  }

  getFacts() {
    return getPrivacyDataCenterFacts({ providerType: this.providerType, online: this.online() });
  }
}
