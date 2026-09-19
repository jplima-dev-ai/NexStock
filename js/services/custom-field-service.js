export const CUSTOM_FIELD_TYPES = Object.freeze(["text", "number", "currency", "date", "boolean", "select", "multiselect", "url"]);
const TYPE_SET = new Set(CUSTOM_FIELD_TYPES);

function normalizeLabel(value) {
  const label = String(value ?? "").trim().slice(0, 60);
  if (!label) throw new TypeError("Custom field requires a label.");
  return label;
}

function keyBase(label) {
  return label.normalize("NFD").replace(/[\u0300-\u036f]/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_").replace(/^_+|_+$/gu, "").slice(0, 32) || "field";
}

function normalizeOptions(type, options) {
  if (!["select", "multiselect"].includes(type)) return [];
  const values = [...new Set((Array.isArray(options) ? options : String(options ?? "").split(","))
    .map((value) => String(value).trim().slice(0, 60)).filter(Boolean))];
  if (values.length < 2) throw new TypeError("Selection fields require at least two options.");
  return values;
}

export class CustomFieldService {
  constructor({ provider, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
    if (!provider) throw new TypeError("CustomFieldService requires a DataProvider.");
    this.provider = provider;
    this.idFactory = idFactory;
    this.now = now;
  }

  async list(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    return (await this.provider.getAll("customFieldDefinitions", { index: "workspaceId", query: workspaceId }))
      .sort((first, second) => first.order - second.order || first.label.localeCompare(second.label));
  }

  async create(workspace, input) {
    if (!workspace?.id || !workspace.profileKey) throw new TypeError("A workspace is required.");
    const label = normalizeLabel(input.label);
    const type = String(input.type ?? "");
    if (!TYPE_SET.has(type)) throw new RangeError("Custom field type is invalid.");
    const existing = await this.list(workspace.id);
    const usedKeys = new Set(existing.map(({ key }) => key));
    const base = `custom_${keyBase(label)}`;
    let key = base;
    let suffix = 2;
    while (usedKeys.has(key)) { key = `${base}_${suffix}`; suffix += 1; }
    const timestamp = this.now();
    const definition = Object.freeze({
      id: this.idFactory(), workspaceId: workspace.id, profileKey: workspace.profileKey,
      key, label, type, required: Boolean(input.required), options: normalizeOptions(type, input.options),
      searchable: Boolean(input.searchable), order: existing.length, enabled: true,
      createdAt: timestamp, updatedAt: timestamp,
    });
    const audit = { id: this.idFactory(), workspaceId: workspace.id, entityType: "customFieldDefinition", entityId: definition.id, action: "CUSTOM_FIELD_CREATED", beforeData: null, afterData: definition, metadata: {}, createdAt: timestamp };
    await this.provider.bulkPut({ customFieldDefinitions: [definition], auditLogs: [audit] });
    return definition;
  }

  async setEnabled(workspaceId, definitionId, enabled) {
    const current = await this.provider.get("customFieldDefinitions", definitionId);
    if (!current || current.workspaceId !== workspaceId) throw new RangeError("Custom field not found.");
    const timestamp = this.now();
    const definition = { ...current, enabled: Boolean(enabled), updatedAt: timestamp };
    const audit = { id: this.idFactory(), workspaceId, entityType: "customFieldDefinition", entityId: definition.id, action: definition.enabled ? "CUSTOM_FIELD_ENABLED" : "CUSTOM_FIELD_DISABLED", beforeData: current, afterData: definition, metadata: {}, createdAt: timestamp };
    await this.provider.bulkPut({ customFieldDefinitions: [definition], auditLogs: [audit] });
    return definition;
  }
}
