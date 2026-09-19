const LIFECYCLE_STATES = new Set(["in_stock", "assigned", "maintenance", "retired"]);
const CONDITIONS = new Set(["new", "used", "refurbished", "damaged"]);
const RELATION_TYPES = new Set(["compatible_with", "requires", "replaces", "upgrade_of", "accessory_for"]);

function requiredText(value, name, max = 120) {
  const text = String(value ?? "").trim().slice(0, max);
  if (!text) throw new TypeError(`${name} is required.`);
  return text;
}

function daysUntil(date, now) {
  return Math.ceil((new Date(date).getTime() - now.getTime()) / 86_400_000);
}

export function expiryStatus(expiryDate, now = new Date(), warningDays = 30) {
  const remaining = daysUntil(expiryDate, now);
  if (!Number.isFinite(remaining)) throw new TypeError("Expiry date is invalid.");
  if (remaining < 0) return "expired";
  if (remaining <= warningDays) return "near";
  return "normal";
}

export function calculateKitAvailability(items, products) {
  if (!items.length) return Object.freeze({ quantity: 0, limitingProductId: null });
  const stock = new Map(products.map((product) => [product.id, Number(product.currentQuantity)]));
  const capacities = items.map((item) => ({ productId: item.productId, capacity: Math.floor((stock.get(item.productId) ?? 0) / Number(item.quantityRequired)) }));
  const minimum = Math.min(...capacities.map(({ capacity }) => capacity));
  return Object.freeze({ quantity: Math.max(0, minimum), limitingProductId: capacities.find(({ capacity }) => capacity === minimum)?.productId ?? null });
}

export function buildGuard(sourceProductId, targetProductId, relations, explicitIncompatibilities = []) {
  if (explicitIncompatibilities.some(([first, second]) => (first === sourceProductId && second === targetProductId) || (first === targetProductId && second === sourceProductId))) return "incompatible";
  if (relations.some((relation) => relation.relationType === "compatible_with" && ((relation.sourceProductId === sourceProductId && relation.targetProductId === targetProductId) || (relation.sourceProductId === targetProductId && relation.targetProductId === sourceProductId)))) return "compatible";
  return "unknown";
}

export function findSmartSubstitutes(productId, relations, products) {
  const active = new Map(products.filter(({ archivedAt }) => !archivedAt).map((product) => [product.id, product]));
  const ranked = relations.flatMap((relation) => {
    if (relation.sourceProductId !== productId || !active.has(relation.targetProductId)) return [];
    const rank = relation.relationType === "replaces" ? 1 : relation.relationType === "compatible_with" ? 2 : 3;
    return [{ product: active.get(relation.targetProductId), rank, reason: relation.relationType }];
  }).sort((first, second) => first.rank - second.rank || first.product.name.localeCompare(second.product.name));
  return Object.freeze(ranked);
}

export class ModuleService {
  constructor({ provider, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
    if (!provider) throw new TypeError("ModuleService requires a DataProvider.");
    this.provider = provider; this.idFactory = idFactory; this.now = now;
  }

  async enabledModules(workspaceId) {
    const setting = await this.provider.get("settings", `profile-settings-${workspaceId}`);
    return Object.freeze([...(setting?.value?.modules ?? [])]);
  }

  async #requireModule(workspaceId, moduleKey) {
    if (!(await this.enabledModules(workspaceId)).includes(moduleKey)) throw new RangeError(`Module is disabled: ${moduleKey}`);
  }

  async #activeProduct(workspaceId, productId) {
    const product = await this.provider.get("products", productId);
    if (!product || product.workspaceId !== workspaceId || product.archivedAt) throw new RangeError("Active product not found.");
    return product;
  }

  async createSerial(workspaceId, productId, input) {
    await this.#requireModule(workspaceId, "serial"); await this.#activeProduct(workspaceId, productId);
    const serialNumber = requiredText(input.serialNumber, "serialNumber", 120);
    const duplicate = (await this.provider.getAll("productUnits", { index: "workspaceId", query: workspaceId })).some((unit) => unit.serialNumber === serialNumber && !unit.archivedAt);
    if (duplicate) throw new RangeError("Serial number already exists in this workspace.");
    const condition = input.condition ?? "new"; const lifecycleState = input.lifecycleState ?? "in_stock";
    if (!CONDITIONS.has(condition) || !LIFECYCLE_STATES.has(lifecycleState)) throw new RangeError("Serial state is invalid.");
    const timestamp = this.now();
    const unit = { id: this.idFactory(), workspaceId, productId, serialNumber, condition, lifecycleState, warrantyStart: input.warrantyStart || null, warrantyEnd: input.warrantyEnd || null, customData: {}, createdAt: timestamp, updatedAt: timestamp, archivedAt: null };
    const audit = { id: this.idFactory(), workspaceId, entityType: "productUnit", entityId: unit.id, action: "SERIAL_CREATED", beforeData: null, afterData: unit, metadata: {}, createdAt: timestamp };
    await this.provider.bulkPut({ productUnits: [unit], auditLogs: [audit] }); return unit;
  }

  async setLifecycle(workspaceId, unitId, lifecycleState) {
    await this.#requireModule(workspaceId, "lifecycle");
    if (!LIFECYCLE_STATES.has(lifecycleState)) throw new RangeError("Lifecycle state is invalid.");
    const current = await this.provider.get("productUnits", unitId);
    if (!current || current.workspaceId !== workspaceId) throw new RangeError("Serial not found.");
    const timestamp = this.now(); const unit = { ...current, lifecycleState, updatedAt: timestamp };
    const audit = { id: this.idFactory(), workspaceId, entityType: "productUnit", entityId: unit.id, action: "SERIAL_LIFECYCLE_CHANGED", beforeData: current, afterData: unit, metadata: {}, createdAt: timestamp };
    await this.provider.bulkPut({ productUnits: [unit], auditLogs: [audit] }); return unit;
  }

  async createBatch(workspaceId, productId, input) {
    await this.#requireModule(workspaceId, "expiry"); await this.#activeProduct(workspaceId, productId);
    const batchNumber = requiredText(input.batchNumber, "batchNumber", 80);
    const duplicate = (await this.provider.getAll("batches", { index: "productId", query: productId })).some((batch) => batch.batchNumber === batchNumber && !batch.archivedAt);
    if (duplicate) throw new RangeError("Batch already exists for this product.");
    const quantity = Number(input.quantity); if (!Number.isFinite(quantity) || quantity < 0) throw new RangeError("Batch quantity is invalid.");
    const expiryDate = requiredText(input.expiryDate, "expiryDate", 20); expiryStatus(expiryDate);
    const timestamp = this.now();
    const batch = { id: this.idFactory(), workspaceId, productId, batchNumber, quantity, manufactureDate: input.manufactureDate || null, expiryDate, createdAt: timestamp, updatedAt: timestamp, archivedAt: null };
    const audit = { id: this.idFactory(), workspaceId, entityType: "batch", entityId: batch.id, action: "BATCH_CREATED", beforeData: null, afterData: batch, metadata: {}, createdAt: timestamp };
    await this.provider.bulkPut({ batches: [batch], auditLogs: [audit] }); return batch;
  }

  async createRelation(workspaceId, input) {
    await this.#requireModule(workspaceId, "compatibility");
    await Promise.all([this.#activeProduct(workspaceId, input.sourceProductId), this.#activeProduct(workspaceId, input.targetProductId)]);
    if (input.sourceProductId === input.targetProductId || !RELATION_TYPES.has(input.relationType)) throw new RangeError("Product relation is invalid.");
    const relation = { id: this.idFactory(), workspaceId, sourceProductId: input.sourceProductId, targetProductId: input.targetProductId, relationType: input.relationType, notes: String(input.notes ?? "").trim().slice(0, 500), createdAt: this.now() };
    await this.provider.put("productRelations", relation); return relation;
  }

  async createKit(workspaceId, input) {
    await this.#requireModule(workspaceId, "kits");
    const items = Array.isArray(input.items) ? input.items : [];
    if (!items.length) throw new TypeError("Kit requires items.");
    for (const item of items) {
      await this.#activeProduct(workspaceId, item.productId);
      if (!Number.isFinite(Number(item.quantityRequired)) || Number(item.quantityRequired) <= 0) throw new RangeError("Kit quantity is invalid.");
    }
    const timestamp = this.now(); const kitId = this.idFactory();
    const kit = { id: kitId, workspaceId, name: requiredText(input.name, "name"), description: String(input.description ?? "").trim().slice(0, 500), createdAt: timestamp, updatedAt: timestamp, archivedAt: null };
    const kitItems = items.map((item) => ({ id: this.idFactory(), workspaceId, kitId, productId: item.productId, quantityRequired: Number(item.quantityRequired) }));
    await this.provider.bulkPut({ kits: [kit], kitItems }); return { kit, kitItems };
  }

  async getWorkspaceSnapshot(workspaceId, now = new Date()) {
    const [modules, products, units, batches, relations, kits, kitItems] = await Promise.all([
      this.enabledModules(workspaceId),
      this.provider.getAll("products", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("productUnits", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("batches", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("productRelations", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("kits", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("kitItems", { index: "workspaceId", query: workspaceId }),
    ]);
    return Object.freeze({
      modules, products: products.filter(({ archivedAt }) => !archivedAt),
      units: units.filter(({ archivedAt }) => !archivedAt),
      batches: batches.filter(({ archivedAt }) => !archivedAt).map((batch) => ({ ...batch, status: expiryStatus(batch.expiryDate, now) })),
      relations, kits: kits.filter(({ archivedAt }) => !archivedAt).map((kit) => ({ ...kit, availability: calculateKitAvailability(kitItems.filter((item) => item.kitId === kit.id), products) })),
      variants: products.filter(({ archivedAt }) => !archivedAt).map((product) => ({ productId: product.id, values: Object.fromEntries(["color", "size", "shade", "volume"].flatMap((key) => product.customData?.[key] === undefined ? [] : [[key, product.customData[key]]])) })).filter(({ values }) => Object.keys(values).length > 0),
    });
  }
}
