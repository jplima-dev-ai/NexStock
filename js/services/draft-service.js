const PREFIX = "nexstock:draft";

export class DraftService {
  constructor({ storage = globalThis.localStorage } = {}) {
    this.storage = storage;
  }

  key(workspaceId, formId) {
    if (!workspaceId || !formId) throw new TypeError("Draft requires workspace and form identifiers.");
    return `${PREFIX}:${workspaceId}:${formId}`;
  }

  load(workspaceId, formId) {
    try {
      const value = JSON.parse(this.storage.getItem(this.key(workspaceId, formId)));
      return value && typeof value === "object" && !Array.isArray(value) ? value : null;
    } catch {
      return null;
    }
  }

  save(workspaceId, formId, data) {
    const draft = { ...data, savedAt: new Date().toISOString() };
    this.storage.setItem(this.key(workspaceId, formId), JSON.stringify(draft));
    return draft;
  }

  remove(workspaceId, formId) {
    this.storage.removeItem(this.key(workspaceId, formId));
  }
}
