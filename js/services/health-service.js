const TRACKING_MODES = new Set(["bulk", "batch", "serialized"]);
const LIFECYCLE_STATES = new Set(["in_stock", "assigned", "maintenance", "retired"]);
const CONDITIONS = new Set(["new", "used", "refurbished", "damaged"]);
const RELATION_TYPES = new Set(["compatible_with", "requires", "replaces", "upgrade_of", "accessory_for"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const COLLECTIONS = Object.freeze(["categories", "suppliers", "products", "media", "productUnits", "batches", "movements", "productRelations", "kits", "kitItems"]);

function issue(code, entityType, entityId, relatedId = null) {
  return Object.freeze({ id: `${code}:${entityType}:${entityId}:${relatedId ?? ""}`, code, entityType, entityId, relatedId });
}

function normalized(value) { return String(value ?? "").trim().toUpperCase(); }
function validNumber(value) { return Number.isFinite(Number(value)) && Number(value) >= 0; }
function validDate(value) { return Boolean(value) && Number.isFinite(new Date(value).getTime()); }
function isImageRecord(record) {
  return IMAGE_TYPES.has(record.mimeType) && record.blob instanceof Blob && record.blob.size > 0 && record.blob.type === record.mimeType;
}

function duplicateIssues(records, key, code, entityType) {
  const seen = new Map();
  const issues = [];
  for (const record of records) {
    const value = normalized(record[key]);
    if (!value) continue;
    const first = seen.get(value);
    if (first) issues.push(issue(code, entityType, record.id, first.id));
    else seen.set(value, record);
  }
  return issues;
}

export function evaluateHealth(data) {
  const categories = new Set(data.categories.map(({ id }) => id));
  const suppliers = new Set(data.suppliers.map(({ id }) => id));
  const products = new Set(data.products.map(({ id }) => id));
  const kits = new Set(data.kits.map(({ id }) => id));
  const issues = [];

  for (const product of data.products) {
    if (product.categoryId && !categories.has(product.categoryId)) issues.push(issue("orphanProductCategory", "product", product.id, product.categoryId));
    if (product.supplierId && !suppliers.has(product.supplierId)) issues.push(issue("orphanProductSupplier", "product", product.id, product.supplierId));
    if (!validNumber(product.currentQuantity) || !validNumber(product.minimumStock) || !TRACKING_MODES.has(product.trackingMode ?? "bulk")) issues.push(issue("impossibleProductState", "product", product.id));
  }
  issues.push(...duplicateIssues(data.products, "nexCode", "duplicateNexCode", "product"));

  for (const unit of data.productUnits) {
    if (!products.has(unit.productId)) issues.push(issue("orphanSerial", "productUnit", unit.id, unit.productId));
    if (!LIFECYCLE_STATES.has(unit.lifecycleState ?? "in_stock") || !CONDITIONS.has(unit.condition ?? "new")) issues.push(issue("impossibleSerialState", "productUnit", unit.id));
  }
  issues.push(...duplicateIssues(data.productUnits.filter(({ archivedAt }) => !archivedAt), "serialNumber", "duplicateSerial", "productUnit"));

  for (const batch of data.batches) {
    if (!products.has(batch.productId)) issues.push(issue("orphanBatch", "batch", batch.id, batch.productId));
    if (!validNumber(batch.quantity) || !validDate(batch.expiryDate) || (batch.manufactureDate && (!validDate(batch.manufactureDate) || new Date(batch.manufactureDate) > new Date(batch.expiryDate)))) issues.push(issue("inconsistentBatch", "batch", batch.id));
  }
  for (const media of data.media) {
    if (!products.has(media.productId)) issues.push(issue("orphanMedia", "media", media.id, media.productId));
    if (!isImageRecord(media)) issues.push(issue("invalidMedia", "media", media.id));
  }
  for (const relation of data.productRelations) {
    if (!products.has(relation.sourceProductId) || !products.has(relation.targetProductId) || relation.sourceProductId === relation.targetProductId || !RELATION_TYPES.has(relation.relationType)) issues.push(issue("brokenRelation", "productRelation", relation.id));
  }
  for (const item of data.kitItems) {
    if (!kits.has(item.kitId) || !products.has(item.productId) || !Number.isFinite(Number(item.quantityRequired)) || Number(item.quantityRequired) <= 0) issues.push(issue("orphanKitItem", "kitItem", item.id, item.kitId));
  }
  for (const movement of data.movements) {
    if (!products.has(movement.productId) || !validNumber(movement.quantity) || !validNumber(movement.beforeQuantity) || !validNumber(movement.afterQuantity)) issues.push(issue("orphanMovement", "movement", movement.id, movement.productId));
  }
  return Object.freeze(issues.sort((first, second) => first.code.localeCompare(second.code) || first.entityId.localeCompare(second.entityId)));
}

export class HealthService {
  constructor({ provider }) { if (!provider) throw new TypeError("HealthService requires a DataProvider."); this.provider = provider; }

  async diagnose(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const entries = await Promise.all(COLLECTIONS.map(async (name) => [name, await this.provider.getAll(name, { index: "workspaceId", query: workspaceId })]));
    const issues = evaluateHealth(Object.fromEntries(entries));
    return Object.freeze({ workspaceId, checkedAt: new Date().toISOString(), total: issues.length, healthy: issues.length === 0, issues });
  }
}
