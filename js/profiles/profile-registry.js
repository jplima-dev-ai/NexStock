const PROFILE_DEFINITIONS = {
  technology: {
    key: "technology",
    prefix: "NX",
    seedKey: "technology",
    modules: ["serial", "compatibility", "kits", "lifecycle"],
    fields: [
      { key: "model", labelKey: "profileFields.model", type: "text", required: true, searchable: true },
      { key: "warrantyMonths", labelKey: "profileFields.warrantyMonths", type: "number", required: false, searchable: false },
    ],
  },
  cosmetics: {
    key: "cosmetics",
    prefix: "COS",
    seedKey: "cosmetics",
    modules: ["expiry", "variants"],
    fields: [
      { key: "shade", labelKey: "profileFields.shade", type: "text", required: false, searchable: true },
      { key: "skinType", labelKey: "profileFields.skinType", type: "multiselect", required: false, searchable: true },
    ],
  },
  fashion: {
    key: "fashion",
    prefix: "MOD",
    seedKey: "fashion",
    modules: ["variants"],
    fields: [
      { key: "size", labelKey: "profileFields.size", type: "select", required: true, searchable: true, options: ["P", "M", "G", "GG"] },
      { key: "color", labelKey: "profileFields.color", type: "text", required: true, searchable: true },
    ],
  },
  food: {
    key: "food",
    prefix: "ALI",
    seedKey: "food",
    modules: ["expiry"],
    fields: [
      { key: "storageTemperature", labelKey: "profileFields.storageTemperature", type: "number", required: false, searchable: false },
      { key: "allergens", labelKey: "profileFields.allergens", type: "multiselect", required: false, searchable: true },
    ],
  },
  custom: {
    key: "custom",
    prefix: "CUS",
    seedKey: "custom",
    modules: [],
    fields: [],
  },
};

function freezeDefinition(definition) {
  return Object.freeze({
    ...definition,
    modules: Object.freeze([...definition.modules]),
    fields: Object.freeze(definition.fields.map((field) => Object.freeze({
      ...field,
      options: Object.freeze([...(field.options ?? [])]),
    }))),
  });
}

export const NEX_PROFILES = Object.freeze(Object.fromEntries(
  Object.entries(PROFILE_DEFINITIONS).map(([key, definition]) => [key, freezeDefinition(definition)]),
));

export const PROFILE_KEYS = Object.freeze(Object.keys(NEX_PROFILES));
export const CUSTOM_MODULE_KEYS = Object.freeze(["expiry", "variants", "kits"]);
export const CUSTOM_FIELD_TYPES = Object.freeze(["text", "number", "currency", "date", "boolean", "select", "multiselect", "url"]);

export function getProfileDefinition(profileKey) {
  const profile = NEX_PROFILES[profileKey];
  if (!profile) throw new RangeError(`NexProfile not supported: ${profileKey}`);
  return profile;
}
