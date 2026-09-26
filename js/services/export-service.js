import { getInventoryStatus, normalizeSearchText } from "./product-service.js";

const DATASETS = new Set(["products", "movements", "batches", "audit", "workspace"]);
const FORMATS = new Set(["csv", "json", "print"]);
const MOVEMENT_TYPES = new Set(["IN", "OUT", "ADJUSTMENT"]);
const RECORD_STATES = new Set(["active", "archived", "all"]);

export const EXPORT_DATASETS = Object.freeze([...DATASETS]);
export const EXPORT_FORMATS = Object.freeze([...FORMATS]);

const COLUMNS = Object.freeze({
  products: Object.freeze(["nexCode", "name", "category", "supplier", "trackingMode", "currentQuantity", "minimumStock", "status", "purchasePrice", "salePrice", "location", "description", "archivedAt", "createdAt", "updatedAt"]),
  movements: Object.freeze(["product", "nexCode", "type", "quantity", "beforeQuantity", "afterQuantity", "reason", "notes", "createdAt"]),
  batches: Object.freeze(["product", "nexCode", "batchNumber", "quantity", "manufactureDate", "expiryDate", "archivedAt", "createdAt", "updatedAt"]),
  audit: Object.freeze(["entityType", "entityId", "action", "beforeData", "afterData", "metadata", "createdAt"]),
  workspace: Object.freeze(["name", "profileKey", "currency", "timezone", "theme", "experienceMode", "createdAt", "updatedAt"]),
});

function requireChoice(value, choices, field) {
  if (!choices.has(value)) throw new RangeError(`${field} is not supported.`);
  return value;
}

function normalizeDate(value, endOfDay = false) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) throw new TypeError("Export date filter is invalid.");
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new TypeError("Export date filter is invalid.");
  return date.getTime();
}

export function normalizeExportRequest(input = {}) {
  const dataset = requireChoice(input.dataset ?? "products", DATASETS, "Export dataset");
  const format = requireChoice(input.format ?? "csv", FORMATS, "Export format");
  const recordState = requireChoice(input.recordState ?? "active", RECORD_STATES, "Record state");
  const movementType = input.movementType || "all";
  if (movementType !== "all" && !MOVEMENT_TYPES.has(movementType)) throw new RangeError("Movement type is not supported.");
  const dateFrom = String(input.dateFrom ?? "").trim();
  const dateTo = String(input.dateTo ?? "").trim();
  const fromTime = normalizeDate(dateFrom);
  const toTime = normalizeDate(dateTo, true);
  if (fromTime !== null && toTime !== null && fromTime > toTime) throw new RangeError("Export date range is invalid.");
  return Object.freeze({
    dataset, format, recordState, movementType, dateFrom, dateTo,
    query: String(input.query ?? "").trim().slice(0, 120),
    productId: String(input.productId ?? "").trim(),
  });
}

function jsonCell(value) {
  if (value === null || value === undefined) return "";
  return typeof value === "object" ? JSON.stringify(value) : value;
}

function withinDateRange(record, request) {
  if (!request.dateFrom && !request.dateTo) return true;
  const timestamp = new Date(record.createdAt).getTime();
  if (!Number.isFinite(timestamp)) return false;
  const fromTime = normalizeDate(request.dateFrom);
  const toTime = normalizeDate(request.dateTo, true);
  return (fromTime === null || timestamp >= fromTime) && (toTime === null || timestamp <= toTime);
}

function matchesQuery(row, query) {
  if (!query) return true;
  const normalized = normalizeSearchText(query);
  return Object.values(row).some((value) => normalizeSearchText(jsonCell(value)).includes(normalized));
}

function matchesState(record, state) {
  if (state === "all") return true;
  return state === "archived" ? Boolean(record.archivedAt) : !record.archivedAt;
}

function safeFilenamePart(value) {
  const normalized = normalizeSearchText(value).replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
  return normalized.slice(0, 48) || "workspace";
}

function freezePlan({ workspace, request, rows }) {
  return Object.freeze({
    dataset: request.dataset,
    format: request.format,
    filters: Object.freeze({ ...request }),
    columns: COLUMNS[request.dataset],
    rows: Object.freeze(rows.map((row) => Object.freeze({ ...row }))),
    count: rows.length,
    filename: `nexstock-${safeFilenamePart(workspace.name)}-${request.dataset}`,
    generatedAt: new Date().toISOString(),
  });
}

export function escapeCsvCell(value) {
  let text = String(jsonCell(value)).replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  if (/^[\t ]*[=+\-@]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function serializeExportCsv(plan, labels = {}) {
  const header = plan.columns.map((key) => escapeCsvCell(labels[key] ?? key)).join(",");
  const rows = plan.rows.map((row) => plan.columns.map((key) => escapeCsvCell(row[key])).join(","));
  return `\uFEFF${[header, ...rows].join("\r\n")}`;
}

export function serializeExportJson(plan) {
  return JSON.stringify({
    schema: "nexstock-export-v1", generatedAt: plan.generatedAt,
    dataset: plan.dataset, filters: plan.filters, count: plan.count, records: plan.rows,
  }, null, 2);
}

export class ExportService {
  constructor({ provider }) {
    if (!provider) throw new TypeError("ExportService requires a DataProvider.");
    this.provider = provider;
  }

  async getOptions(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const [workspace, products] = await Promise.all([
      this.provider.get("workspaces", workspaceId),
      this.provider.getAll("products", { index: "workspaceId", query: workspaceId }),
    ]);
    if (!workspace || workspace.id !== workspaceId) throw new RangeError("Workspace not found.");
    return Object.freeze({ workspace, products: Object.freeze(products.map(({ id, name, nexCode, archivedAt }) => Object.freeze({ id, name, nexCode, archivedAt }))) });
  }

  async prepare(workspaceId, input = {}) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const request = normalizeExportRequest(input);
    const workspace = await this.provider.get("workspaces", workspaceId);
    if (!workspace || workspace.id !== workspaceId) throw new RangeError("Workspace not found.");
    const products = await this.provider.getAll("products", { index: "workspaceId", query: workspaceId });
    const productMap = new Map(products.map((product) => [product.id, product]));
    let source;
    if (request.dataset === "workspace") source = [workspace];
    else {
      const store = request.dataset === "audit" ? "auditLogs" : request.dataset;
      source = await this.provider.getAll(store, { index: "workspaceId", query: workspaceId });
    }

    const rows = await this.#rows(request.dataset, source, products, productMap, workspace);
    const filtered = rows.filter(({ sourceRecord, row }) => {
      if (!withinDateRange(sourceRecord, request) || !matchesQuery(row, request.query)) return false;
      if (["products", "batches"].includes(request.dataset) && !matchesState(sourceRecord, request.recordState)) return false;
      if (request.dataset === "movements" && request.movementType !== "all" && sourceRecord.type !== request.movementType) return false;
      if (request.productId) {
        if (request.dataset === "products" && sourceRecord.id !== request.productId) return false;
        if (["movements", "batches"].includes(request.dataset) && sourceRecord.productId !== request.productId) return false;
        if (request.dataset === "audit" && sourceRecord.entityId !== request.productId && sourceRecord.metadata?.productId !== request.productId) return false;
      }
      return true;
    }).map(({ row }) => row);
    return freezePlan({ workspace, request, rows: filtered });
  }

  async #rows(dataset, source, products, productMap, workspace) {
    if (dataset === "products") {
      const [categories, suppliers] = await Promise.all([
        this.provider.getAll("categories", { index: "workspaceId", query: workspace.id }),
        this.provider.getAll("suppliers", { index: "workspaceId", query: workspace.id }),
      ]);
      const categoryMap = new Map(categories.map(({ id, name }) => [id, name]));
      const supplierMap = new Map(suppliers.map(({ id, name }) => [id, name]));
      return products.map((record) => ({ sourceRecord: record, row: {
        nexCode: record.nexCode, name: record.name, category: categoryMap.get(record.categoryId) ?? "",
        supplier: supplierMap.get(record.supplierId) ?? "", trackingMode: record.trackingMode,
        currentQuantity: record.currentQuantity, minimumStock: record.minimumStock,
        status: getInventoryStatus(record.currentQuantity, record.minimumStock), purchasePrice: record.purchasePrice,
        salePrice: record.salePrice, location: record.location, description: record.description,
        archivedAt: record.archivedAt, createdAt: record.createdAt, updatedAt: record.updatedAt,
      } }));
    }
    if (dataset === "movements") return source.map((record) => ({ sourceRecord: record, row: {
      product: productMap.get(record.productId)?.name ?? "", nexCode: productMap.get(record.productId)?.nexCode ?? "",
      type: record.type, quantity: record.quantity, beforeQuantity: record.beforeQuantity,
      afterQuantity: record.afterQuantity, reason: record.reason, notes: record.notes, createdAt: record.createdAt,
    } }));
    if (dataset === "batches") return source.map((record) => ({ sourceRecord: record, row: {
      product: productMap.get(record.productId)?.name ?? "", nexCode: productMap.get(record.productId)?.nexCode ?? "",
      batchNumber: record.batchNumber, quantity: record.quantity, manufactureDate: record.manufactureDate,
      expiryDate: record.expiryDate, archivedAt: record.archivedAt, createdAt: record.createdAt, updatedAt: record.updatedAt,
    } }));
    if (dataset === "audit") return source.map((record) => ({ sourceRecord: record, row: {
      entityType: record.entityType, entityId: record.entityId, action: record.action,
      beforeData: record.beforeData, afterData: record.afterData, metadata: record.metadata, createdAt: record.createdAt,
    } }));
    return [{ sourceRecord: workspace, row: {
      name: workspace.name, profileKey: workspace.profileKey, currency: workspace.currency,
      timezone: workspace.timezone, theme: workspace.theme, experienceMode: workspace.experienceMode,
      createdAt: workspace.createdAt, updatedAt: workspace.updatedAt,
    } }];
  }
}
