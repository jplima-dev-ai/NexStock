const ACTIVE_WORKSPACE_SETTING = "active-workspace";

function defaultIdFactory() {
  if (!globalThis.crypto?.randomUUID) throw new Error("Secure UUID generation is unavailable.");
  return globalThis.crypto.randomUUID();
}

function createBaseRecord({ id, workspaceId, timestamp }) {
  return { id, workspaceId, createdAt: timestamp, updatedAt: timestamp, archivedAt: null };
}

export class WorkspaceService {
  constructor({ provider, seedLoader, idFactory = defaultIdFactory, now = () => new Date().toISOString() }) {
    if (!provider) throw new TypeError("WorkspaceService requires a DataProvider.");
    if (typeof seedLoader !== "function") throw new TypeError("WorkspaceService requires a seed loader.");
    this.provider = provider;
    this.seedLoader = seedLoader;
    this.idFactory = idFactory;
    this.now = now;
  }

  async restoreActiveWorkspace() {
    const setting = await this.provider.get("settings", ACTIVE_WORKSPACE_SETTING);
    if (!setting?.workspaceId) return null;
    const workspace = await this.provider.get("workspaces", setting.workspaceId);
    if (workspace) return workspace;
    await this.provider.delete("settings", ACTIVE_WORKSPACE_SETTING);
    return null;
  }

  async createDemoWorkspace(profileKey, preferences = {}) {
    const seed = await this.seedLoader(profileKey);
    const timestamp = this.now();
    const workspaceId = this.idFactory();
    const workspace = {
      id: workspaceId,
      name: preferences.name ?? seed.workspace.name,
      profileKey,
      locale: preferences.locale ?? "pt-BR",
      currency: preferences.currency ?? seed.workspace.currency ?? "BRL",
      timezone: preferences.timezone ?? seed.workspace.timezone ?? "America/Sao_Paulo",
      experienceMode: preferences.experienceMode ?? "guided",
      theme: preferences.theme ?? "light",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const categoryIds = new Map();
    const categoryCodes = new Map();
    const categories = seed.categories.map((category) => {
      const id = this.idFactory();
      categoryIds.set(category.key, id);
      categoryCodes.set(category.key, category.code);
      return {
        ...createBaseRecord({ id, workspaceId, timestamp }),
        name: category.name,
        code: category.code,
        description: category.description ?? "",
      };
    });

    const supplierIds = new Map();
    const suppliers = seed.suppliers.map((supplier) => {
      const id = this.idFactory();
      supplierIds.set(supplier.key, id);
      return {
        ...createBaseRecord({ id, workspaceId, timestamp }),
        name: supplier.name,
        contactName: "",
        email: "",
        phone: "",
        notes: supplier.notes ?? "",
      };
    });

    const profileSettings = preferences.profileSettings ?? { prefix: "NX", modules: [] };
    const products = seed.products.map((product, index) => ({
      ...createBaseRecord({ id: this.idFactory(), workspaceId, timestamp }),
      categoryId: product.categoryKey ? categoryIds.get(product.categoryKey) : null,
      supplierId: product.supplierKey ? supplierIds.get(product.supplierKey) : null,
      name: product.name,
      nexCode: product.nexCode ?? `${profileSettings.prefix}-${categoryCodes.get(product.categoryKey) ?? "GEN"}-${String(index + 1).padStart(4, "0")}`,
      description: product.description ?? "",
      trackingMode: product.trackingMode ?? "bulk",
      currentQuantity: Number(product.currentQuantity ?? 0),
      minimumStock: Number(product.minimumStock ?? 0),
      purchasePrice: Number(product.purchasePrice ?? 0),
      salePrice: Number(product.salePrice ?? 0),
      location: product.location ?? "",
      customData: { ...(product.customData ?? {}) },
    }));

    const customFieldDefinitions = (preferences.customFieldDefinitions ?? []).map((field, index) => ({
      id: this.idFactory(),
      workspaceId,
      profileKey,
      key: field.key,
      label: field.label,
      type: field.type,
      required: Boolean(field.required),
      options: [...(field.options ?? [])],
      searchable: Boolean(field.searchable),
      order: index,
      enabled: field.enabled !== false,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    await this.provider.bulkPut({
      meta: [{ key: "schema-version", value: 1, updatedAt: timestamp }],
      workspaces: [workspace],
      categories,
      suppliers,
      products,
      customFieldDefinitions,
      settings: [
        { id: ACTIVE_WORKSPACE_SETTING, workspaceId, value: workspaceId, updatedAt: timestamp },
        { id: `profile-settings-${workspaceId}`, workspaceId, value: profileSettings, updatedAt: timestamp },
      ],
    });
    return workspace;
  }

  async resetActiveWorkspace() {
    const current = await this.restoreActiveWorkspace();
    if (!current) return null;
    const [profileSetting, customFieldDefinitions] = await Promise.all([
      this.provider.get("settings", `profile-settings-${current.id}`),
      this.provider.getAll("customFieldDefinitions", { index: "workspaceId", query: current.id }),
    ]);
    await this.provider.deleteWorkspace(current.id);
    return this.createDemoWorkspace(current.profileKey, {
      name: current.name,
      locale: current.locale,
      currency: current.currency,
      timezone: current.timezone,
      experienceMode: current.experienceMode,
      theme: current.theme ?? "light",
      profileSettings: profileSetting?.value,
      customFieldDefinitions: customFieldDefinitions.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options,
        searchable: field.searchable,
        enabled: field.enabled,
      })),
    });
  }
}
