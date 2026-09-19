import {
  CUSTOM_FIELD_TYPES,
  CUSTOM_MODULE_KEYS,
  getProfileDefinition,
  PROFILE_KEYS,
} from "../profiles/profile-registry.js";

function uniqueAllowed(values, allowed) {
  const allowedSet = new Set(allowed);
  if (!Array.isArray(values) || values.some((value) => !allowedSet.has(value))) {
    throw new RangeError("Custom module not supported.");
  }
  return [...new Set(values)];
}

function createCustomFieldKey(label, index) {
  const normalized = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "")
    .slice(0, 32);
  return `custom_${normalized || "field"}_${index + 1}`;
}

export function normalizeCustomFields(fields = []) {
  if (!Array.isArray(fields)) throw new TypeError("Custom fields must be an array.");
  return fields.map((field, index) => {
    const label = String(field.label ?? "").trim().slice(0, 60);
    if (!label) throw new TypeError("Custom field requires a label.");
    if (!CUSTOM_FIELD_TYPES.includes(field.type)) throw new RangeError(`Custom field type not supported: ${field.type}`);
    const options = [...new Set((field.options ?? []).map((value) => String(value).trim()).filter(Boolean))];
    if (["select", "multiselect"].includes(field.type) && options.length < 2) throw new TypeError("Selection fields require at least two options.");
    return {
      key: createCustomFieldKey(label, index),
      label,
      type: field.type,
      required: Boolean(field.required),
      searchable: Boolean(field.searchable ?? ["text", "number", "currency", "select", "multiselect"].includes(field.type)),
      options,
      enabled: true,
    };
  });
}

export class ProfileService {
  constructor({ workspaceService, translate = (key) => key }) {
    if (!workspaceService) throw new TypeError("ProfileService requires WorkspaceService.");
    this.workspaceService = workspaceService;
    this.translate = translate;
  }

  listProfiles() {
    return PROFILE_KEYS.map((key) => getProfileDefinition(key));
  }

  async createWorkspace(setup) {
    const profile = getProfileDefinition(setup.profileKey);
    const name = String(setup.name ?? "").trim();
    if (!name || name.length > 80) throw new TypeError("Workspace name must contain 1 to 80 characters.");
    const modules = profile.key === "custom"
      ? uniqueAllowed(setup.customModules ?? [], CUSTOM_MODULE_KEYS)
      : [...profile.modules];
    const fields = profile.key === "custom"
      ? normalizeCustomFields(setup.customFields)
      : profile.fields.map((field) => ({
        ...field,
        label: this.translate(field.labelKey),
        enabled: true,
      }));

    return this.workspaceService.createDemoWorkspace(profile.seedKey, {
      name,
      locale: setup.locale,
      experienceMode: setup.experienceMode,
      profileSettings: { prefix: profile.prefix, modules },
      customFieldDefinitions: fields,
    });
  }
}
