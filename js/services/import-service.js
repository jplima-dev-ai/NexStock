import { buildNexCode, normalizeSearchText } from "./product-service.js";

const MAX_CSV_SIZE = 2 * 1024 * 1024;
const MAX_ROWS = 1000;
const TRACKING_MODES = new Set(["bulk", "batch", "serialized"]);

export const IMPORT_FIELDS = Object.freeze([
  Object.freeze({ key: "name", required: true }),
  Object.freeze({ key: "currentQuantity", required: true }),
  Object.freeze({ key: "minimumStock", required: true }),
  Object.freeze({ key: "category", required: false }),
  Object.freeze({ key: "supplier", required: false }),
  Object.freeze({ key: "purchasePrice", required: false }),
  Object.freeze({ key: "salePrice", required: false }),
  Object.freeze({ key: "location", required: false }),
  Object.freeze({ key: "description", required: false }),
  Object.freeze({ key: "trackingMode", required: false }),
]);

const HEADER_ALIASES = Object.freeze({
  name: ["name", "nome", "product", "produto", "producto"],
  currentQuantity: ["currentquantity", "quantity", "quantidade", "cantidad", "estoqueatual", "stock"],
  minimumStock: ["minimumstock", "minimum", "minimo", "estoqueminimo", "stockminimo"],
  category: ["category", "categoria"],
  supplier: ["supplier", "fornecedor", "proveedor"],
  purchasePrice: ["purchaseprice", "cost", "custo", "precocompra", "preciocompra"],
  salePrice: ["saleprice", "price", "preco", "precovenda", "precioventa"],
  location: ["location", "localizacao", "ubicacion"],
  description: ["description", "descricao", "descripcion"],
  trackingMode: ["trackingmode", "tracking", "rastreamento", "seguimiento"],
});

function normalizeHeader(value) {
  return normalizeSearchText(value).replace(/[^a-z0-9]/gu, "");
}

function detectDelimiter(line) {
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    else if (!quoted && Object.hasOwn(counts, character)) counts[character] += 1;
  }
  return Object.entries(counts).sort((first, second) => second[1] - first[1])[0][1] > 0
    ? Object.entries(counts).sort((first, second) => second[1] - first[1])[0][0]
    : ",";
}

function parseMatrix(text, delimiter) {
  const matrix = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) matrix.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (quoted) throw new TypeError("CSV contains an unclosed quoted value.");
  row.push(value);
  if (row.some((cell) => cell.trim() !== "")) matrix.push(row);
  return matrix;
}

export function parseCsv(csvText) {
  const text = String(csvText ?? "").replace(/^\uFEFF/u, "");
  if (!text.trim()) throw new TypeError("CSV is empty.");
  if (new TextEncoder().encode(text).byteLength > MAX_CSV_SIZE) throw new RangeError("CSV is too large.");
  const delimiter = detectDelimiter(text.split(/\r?\n/u, 1)[0]);
  const matrix = parseMatrix(text, delimiter);
  if (matrix.length < 2) throw new TypeError("CSV requires a header and at least one data row.");
  const headers = matrix[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new TypeError("CSV headers cannot be empty.");
  const normalizedHeaders = headers.map(normalizeHeader);
  if (new Set(normalizedHeaders).size !== normalizedHeaders.length) throw new TypeError("CSV headers must be unique.");
  const rows = matrix.slice(1);
  if (rows.length > MAX_ROWS) throw new RangeError("CSV has too many rows.");
  return Object.freeze({ headers: Object.freeze(headers), rows: Object.freeze(rows.map((row) => Object.freeze([...row]))), delimiter });
}

export function suggestImportMapping(headers) {
  const normalized = headers.map(normalizeHeader);
  return Object.freeze(Object.fromEntries(IMPORT_FIELDS.map(({ key }) => {
    const index = normalized.findIndex((header) => HEADER_ALIASES[key].includes(header));
    return [key, index >= 0 ? headers[index] : ""];
  })));
}

export function mapImportRows(parsed, mapping) {
  for (const field of IMPORT_FIELDS.filter(({ required }) => required)) {
    if (!mapping[field.key] || !parsed.headers.includes(mapping[field.key])) throw new TypeError(`Required mapping is missing: ${field.key}`);
  }
  const headerIndex = new Map(parsed.headers.map((header, index) => [header, index]));
  return parsed.rows.map((row, index) => Object.fromEntries([
    ["sourceRow", index + 2],
    ...IMPORT_FIELDS.map(({ key }) => [key, mapping[key] ? String(row[headerIndex.get(mapping[key])] ?? "").trim() : ""]),
  ]));
}

function parseNonNegative(value, field, errors, { optional = false } = {}) {
  if (optional && String(value ?? "").trim() === "") return 0;
  const normalized = String(value ?? "").trim().replace(",", ".");
  const number = Number(normalized);
  if (!Number.isFinite(number) || number < 0) { errors.push({ field, code: "nonNegativeNumber" }); return 0; }
  return number;
}

function matchRelation(value, records, field, errors) {
  if (!value) return null;
  const query = normalizeSearchText(value);
  const match = records.find((record) => normalizeSearchText(record.name) === query || normalizeSearchText(record.code) === query);
  if (!match) { errors.push({ field, code: "unknownRelation" }); return null; }
  return match.id;
}

function freezeAnalysis(rows) {
  const frozenRows = rows.map((row) => Object.freeze({
    sourceRow: row.sourceRow,
    input: Object.freeze({ ...row.input }),
    product: Object.freeze({ ...row.product, customData: Object.freeze({}) }),
    errors: Object.freeze(row.errors.map((error) => Object.freeze({ ...error }))),
  }));
  const errorCount = frozenRows.reduce((total, row) => total + row.errors.length, 0);
  return Object.freeze({
    rows: Object.freeze(frozenRows), total: frozenRows.length,
    validCount: frozenRows.filter((row) => row.errors.length === 0).length,
    errorCount, ready: frozenRows.length > 0 && errorCount === 0,
  });
}

export function analyzeImportRows(mappedRows, { existingProducts = [], categories = [], suppliers = [] } = {}) {
  const existingNames = new Set(existingProducts.map((product) => normalizeSearchText(product.name)));
  const fileNames = new Map();
  const analyzed = mappedRows.map((input) => {
    const errors = [];
    const name = String(input.name ?? "").trim().replace(/\s+/gu, " ");
    if (name.length < 2 || name.length > 120) errors.push({ field: "name", code: "invalidText" });
    const normalizedName = normalizeSearchText(name);
    if (normalizedName && existingNames.has(normalizedName)) errors.push({ field: "name", code: "duplicateExisting" });
    if (normalizedName) fileNames.set(normalizedName, (fileNames.get(normalizedName) ?? 0) + 1);
    const trackingMode = String(input.trackingMode || "bulk").toLowerCase();
    if (!TRACKING_MODES.has(trackingMode)) errors.push({ field: "trackingMode", code: "invalidTracking" });
    const product = {
      name,
      categoryId: matchRelation(input.category, categories, "category", errors),
      supplierId: matchRelation(input.supplier, suppliers, "supplier", errors),
      description: String(input.description ?? "").trim().slice(0, 1000),
      trackingMode: TRACKING_MODES.has(trackingMode) ? trackingMode : "bulk",
      currentQuantity: parseNonNegative(input.currentQuantity, "currentQuantity", errors),
      minimumStock: parseNonNegative(input.minimumStock, "minimumStock", errors),
      purchasePrice: parseNonNegative(input.purchasePrice, "purchasePrice", errors, { optional: true }),
      salePrice: parseNonNegative(input.salePrice, "salePrice", errors, { optional: true }),
      location: String(input.location ?? "").trim().slice(0, 80),
      customData: {},
    };
    return { sourceRow: Number(input.sourceRow), input: { ...input }, product, errors };
  });
  for (const row of analyzed) {
    const normalizedName = normalizeSearchText(row.product.name);
    if (normalizedName && fileNames.get(normalizedName) > 1) row.errors.push({ field: "name", code: "duplicateFile" });
  }
  return freezeAnalysis(analyzed);
}

export class ImportService {
  constructor({ provider, snapshotService, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
    if (!provider) throw new TypeError("ImportService requires a DataProvider.");
    this.provider = provider;
    this.snapshotService = snapshotService;
    this.idFactory = idFactory;
    this.now = now;
  }

  async #context(workspaceId) {
    const [existingProducts, categories, suppliers, profileSetting] = await Promise.all([
      this.provider.getAll("products", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("categories", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("suppliers", { index: "workspaceId", query: workspaceId }),
      this.provider.get("settings", `profile-settings-${workspaceId}`),
    ]);
    return { existingProducts, categories, suppliers, profileSetting };
  }

  async prepare(workspaceId, parsed, mapping) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    return this.reanalyze(workspaceId, mapImportRows(parsed, mapping));
  }

  async reanalyze(workspaceId, mappedRows) {
    const context = await this.#context(workspaceId);
    return analyzeImportRows(mappedRows, context);
  }

  async commit(workspaceId, analysis) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    if (!analysis?.ready || !analysis.rows?.length) throw new TypeError("Only a valid import plan can be confirmed.");
    const context = await this.#context(workspaceId);
    const fresh = analyzeImportRows(analysis.rows.map(({ input }) => input), context);
    if (!fresh.ready) throw new Error("Import plan is no longer valid.");

    const prefix = context.profileSetting?.value?.prefix ?? "NX";
    const categories = new Map(context.categories.map((category) => [category.id, category]));
    const sequences = new Map();
    for (const product of context.existingProducts) {
      const category = categories.get(product.categoryId);
      const code = category?.code ?? "GEN";
      const start = `${prefix}-${code}-`.toUpperCase();
      if (!product.nexCode?.toUpperCase().startsWith(start)) continue;
      const sequence = Number.parseInt(product.nexCode.slice(start.length), 10);
      if (Number.isInteger(sequence)) sequences.set(code, Math.max(sequences.get(code) ?? 0, sequence));
    }

    const timestamp = this.now();
    const audits = [];
    const products = fresh.rows.map((row) => {
      const categoryCode = categories.get(row.product.categoryId)?.code ?? "GEN";
      const sequence = (sequences.get(categoryCode) ?? 0) + 1;
      sequences.set(categoryCode, sequence);
      const product = {
        id: this.idFactory(), workspaceId, ...row.product,
        nexCode: buildNexCode({ prefix, categoryCode, sequence }),
        createdAt: timestamp, updatedAt: timestamp, archivedAt: null,
      };
      audits.push({
        id: this.idFactory(), workspaceId, entityType: "product", entityId: product.id,
        action: "PRODUCT_IMPORTED", beforeData: null, afterData: product,
        metadata: { source: "csv", sourceRow: row.sourceRow }, createdAt: timestamp,
      });
      return product;
    });
    await this.snapshotService?.create(workspaceId, { reason: "before-import" });
    await this.provider.bulkPut({ products, auditLogs: audits });
    return Object.freeze({ products: Object.freeze(products), audits: Object.freeze(audits) });
  }
}
