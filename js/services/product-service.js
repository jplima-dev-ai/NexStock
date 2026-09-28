import { assertSafeUrl } from "../utils/security.js";

const TRACKING_MODES = new Set(["bulk", "batch", "serialized"]);
export const PRODUCT_PAGE_SIZE = 25;

function requireText(value, field, maxLength = 120) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.length > maxLength) throw new TypeError(`${field} is invalid.`);
  return normalized;
}

function nonNegativeNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new RangeError(`${field} must be non-negative.`);
  return number;
}

export function normalizeSearchText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/gu, "").toLocaleLowerCase();
}

export function getInventoryStatus(currentQuantity, minimumStock) {
  const quantity = Number(currentQuantity);
  const minimum = Number(minimumStock);
  if (quantity <= 0) return "out";
  if (quantity <= minimum) return "critical";
  const attentionThreshold = Math.max(minimum + 1, Math.ceil(minimum * 1.5));
  return quantity <= attentionThreshold ? "attention" : "healthy";
}

export function paginateProducts(products, { page = 1, pageSize = PRODUCT_PAGE_SIZE } = {}) {
  if (!Array.isArray(products)) throw new TypeError("Products must be an array.");
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new RangeError("Page size is invalid.");
  const total = products.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, Number.parseInt(page, 10) || 1), pageCount);
  const from = total === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
  const to = Math.min(total, currentPage * pageSize);
  return Object.freeze({ items: Object.freeze(products.slice(from - 1, to)), total, page: currentPage, pageCount, from, to, pageSize });
}

export function buildNexCode({ prefix, categoryCode, sequence }) {
  const safePrefix = requireText(prefix, "prefix", 8).toUpperCase().replace(/[^A-Z0-9]/gu, "");
  const safeCategory = requireText(categoryCode, "categoryCode", 8).toUpperCase().replace(/[^A-Z0-9]/gu, "");
  if (!safePrefix || !safeCategory || !Number.isInteger(sequence) || sequence < 1) throw new TypeError("NexCode parts are invalid.");
  return `${safePrefix}-${safeCategory}-${String(sequence).padStart(4, "0")}`;
}

export class ProductService {
  constructor({ provider, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
    if (!provider) throw new TypeError("ProductService requires a DataProvider.");
    this.provider = provider;
    this.idFactory = idFactory;
    this.now = now;
  }

  async listByWorkspace(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    return this.provider.getAll("products", { index: "workspaceId", query: workspaceId });
  }

  async getById(productId, workspaceId) {
    if (!productId) throw new TypeError("A product ID is required.");
    const product = await this.provider.get("products", productId);
    if (!product || (workspaceId && product.workspaceId !== workspaceId)) return null;
    return product;
  }

  async getFormOptions(workspaceId) {
    const [categories, suppliers, customFields, profileSettings] = await Promise.all([
      this.provider.getAll("categories", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("suppliers", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("customFieldDefinitions", { index: "workspaceId", query: workspaceId }),
      this.provider.get("settings", `profile-settings-${workspaceId}`),
    ]);
    return { categories, suppliers, customFields: customFields.filter(({ enabled }) => enabled !== false), modules: [...(profileSettings?.value?.modules ?? [])] };
  }

  async #nextCode(workspaceId, categoryId) {
    const [category, profileSettings, products] = await Promise.all([
      categoryId ? this.provider.get("categories", categoryId) : null,
      this.provider.get("settings", `profile-settings-${workspaceId}`),
      this.listByWorkspace(workspaceId),
    ]);
    if (category && category.workspaceId !== workspaceId) throw new RangeError("Category belongs to another workspace.");
    const prefix = profileSettings?.value?.prefix ?? "NX";
    const categoryCode = category?.code ?? "GEN";
    const start = `${prefix}-${categoryCode}-`.toUpperCase();
    const maximum = products.reduce((current, product) => {
      if (!product.nexCode?.toUpperCase().startsWith(start)) return current;
      const sequence = Number.parseInt(product.nexCode.slice(start.length), 10);
      return Number.isInteger(sequence) ? Math.max(current, sequence) : current;
    }, 0);
    return buildNexCode({ prefix, categoryCode, sequence: maximum + 1 });
  }

  async #validateRelations(workspaceId, input) {
    const [category, supplier] = await Promise.all([
      input.categoryId ? this.provider.get("categories", input.categoryId) : null,
      input.supplierId ? this.provider.get("suppliers", input.supplierId) : null,
    ]);
    if (input.categoryId && category?.workspaceId !== workspaceId) throw new RangeError("Category belongs to another workspace.");
    if (input.supplierId && supplier?.workspaceId !== workspaceId) throw new RangeError("Supplier belongs to another workspace.");
  }

  async #validateCustomData(workspaceId, customData = {}) {
    const definitions = (await this.provider.getAll("customFieldDefinitions", { index: "workspaceId", query: workspaceId })).filter(({ enabled }) => enabled !== false);
    for (const definition of definitions) {
      const value = customData?.[definition.key];
      if (definition.required && (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))) throw new TypeError(`Custom field ${definition.key} is required.`);
      if (value === undefined || value === null || value === "") continue;
      if (["number", "currency"].includes(definition.type) && !Number.isFinite(Number(value))) throw new TypeError(`Custom field ${definition.key} must be numeric.`);
      if (definition.type === "boolean" && typeof value !== "boolean") throw new TypeError(`Custom field ${definition.key} must be boolean.`);
      if (definition.type === "url") {
        assertSafeUrl(value);
      }
      if (definition.type === "select" && !definition.options.includes(value)) throw new TypeError(`Custom field ${definition.key} has an invalid option.`);
      if (definition.type === "multiselect" && (!Array.isArray(value) || value.some((item) => !definition.options.includes(item)))) throw new TypeError(`Custom field ${definition.key} has invalid options.`);
    }
  }

  #normalizeInput(input, currentQuantity = 0) {
    const trackingMode = input.trackingMode ?? "bulk";
    if (!TRACKING_MODES.has(trackingMode)) throw new RangeError("Tracking mode is invalid.");
    return {
      name: requireText(input.name, "name"), categoryId: input.categoryId || null, supplierId: input.supplierId || null,
      description: String(input.description ?? "").trim().slice(0, 1000), trackingMode,
      currentQuantity: nonNegativeNumber(input.currentQuantity ?? currentQuantity, "currentQuantity"),
      minimumStock: nonNegativeNumber(input.minimumStock ?? 0, "minimumStock"),
      purchasePrice: nonNegativeNumber(input.purchasePrice ?? 0, "purchasePrice"),
      salePrice: nonNegativeNumber(input.salePrice ?? 0, "salePrice"),
      location: String(input.location ?? "").trim().slice(0, 80),
      customData: input.customData && typeof input.customData === "object" && !Array.isArray(input.customData) ? { ...input.customData } : {},
    };
  }

  #audit(workspaceId, product, action, beforeData, timestamp) {
    return { id: this.idFactory(), workspaceId, entityType: "product", entityId: product.id, action, beforeData, afterData: product, metadata: {}, createdAt: timestamp };
  }

  async create(workspaceId, input) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    await this.#validateRelations(workspaceId, input);
    await this.#validateCustomData(workspaceId, input.customData);
    const timestamp = this.now();
    const product = { id: this.idFactory(), workspaceId, ...this.#normalizeInput(input), nexCode: await this.#nextCode(workspaceId, input.categoryId), createdAt: timestamp, updatedAt: timestamp, archivedAt: null };
    await this.provider.bulkPut({ products: [product], auditLogs: [this.#audit(workspaceId, product, "PRODUCT_CREATED", null, timestamp)] });
    return product;
  }

  async update(workspaceId, productId, input) {
    const current = await this.getById(productId, workspaceId);
    if (!current) throw new RangeError("Product not found.");
    await this.#validateRelations(workspaceId, input);
    await this.#validateCustomData(workspaceId, input.customData);
    const timestamp = this.now();
    const normalized = this.#normalizeInput({ ...input, currentQuantity: current.currentQuantity }, current.currentQuantity);
    const product = { ...current, ...normalized, currentQuantity: current.currentQuantity, nexCode: current.nexCode, updatedAt: timestamp };
    await this.provider.bulkPut({ products: [product], auditLogs: [this.#audit(workspaceId, product, "PRODUCT_UPDATED", current, timestamp)] });
    return product;
  }

  async archive(workspaceId, productId) {
    const current = await this.getById(productId, workspaceId);
    if (!current) throw new RangeError("Product not found.");
    if (current.archivedAt) return current;
    const timestamp = this.now();
    const product = { ...current, archivedAt: timestamp, updatedAt: timestamp };
    await this.provider.bulkPut({ products: [product], auditLogs: [this.#audit(workspaceId, product, "PRODUCT_ARCHIVED", current, timestamp)] });
    return product;
  }

  async search(workspaceId, filters = {}) {
    const [products, options] = await Promise.all([this.listByWorkspace(workspaceId), this.getFormOptions(workspaceId)]);
    const categories = new Map(options.categories.map((item) => [item.id, item.name]));
    const suppliers = new Map(options.suppliers.map((item) => [item.id, item.name]));
    const searchableFields = new Set(options.customFields.filter(({ searchable }) => searchable).map(({ key }) => key));
    const query = normalizeSearchText(filters.query);
    return products.map((product) => ({ ...product, categoryName: categories.get(product.categoryId) ?? "", supplierName: suppliers.get(product.supplierId) ?? "", status: getInventoryStatus(product.currentQuantity, product.minimumStock) }))
      .filter((product) => {
        const archiveMatch = filters.archived === "all" || (filters.archived === "archived" ? Boolean(product.archivedAt) : !product.archivedAt);
        const values = [product.name, product.nexCode, product.categoryName, product.supplierName, product.customData?.manufacturer];
        for (const key of searchableFields) values.push(product.customData?.[key]);
        const moduleMatch = !filters.module || (["serial", "lifecycle"].includes(filters.module) && product.trackingMode === "serialized") || (filters.module === "expiry" && product.trackingMode === "batch") || (filters.module === "variants" && ["color", "size", "shade", "volume"].some((key) => product.customData?.[key] !== undefined));
        return archiveMatch && moduleMatch && (!filters.categoryId || product.categoryId === filters.categoryId) && (!filters.supplierId || product.supplierId === filters.supplierId) && (!filters.status || product.status === filters.status) && (!query || values.some((value) => normalizeSearchText(value).includes(query)));
      }).sort((first, second) => first.name.localeCompare(second.name));
  }

  async searchPage(workspaceId, filters = {}, pagination = {}) {
    return paginateProducts(await this.search(workspaceId, filters), pagination);
  }
}
