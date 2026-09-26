import { APP_VERSION } from "../core/version.js";

export const BACKUP_SCHEMA = "nexstock-backup-v1";
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
export const MAX_BACKUP_RECORDS = 50_000;
export const BACKUP_STORES = Object.freeze([
  "workspaces", "categories", "suppliers", "products", "productUnits", "batches", "movements",
  "auditLogs", "productRelations", "kits", "kitItems", "customFieldDefinitions", "settings",
]);

export class BackupValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "BackupValidationError";
    this.code = code;
  }
}

function invalid(code, message) {
  throw new BackupValidationError(code, message);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeFilenamePart(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 48) || "workspace";
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary);
}

function base64ToBlob(value, mimeType) {
  const binary = globalThis.atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

async function serializeMedia(records) {
  return Promise.all(records.map(async (record) => ({
    id: record.id, workspaceId: record.workspaceId, productId: record.productId, altText: record.altText,
    mimeType: record.mimeType, contentBase64: bytesToBase64(new Uint8Array(await record.blob.arrayBuffer())),
  })));
}

export function isLocalSnapshotSetting(record) {
  return record?.value?.type === "localSnapshot" && record.value.schema === "nexstock-snapshot-v1";
}

function assertReference(records, field, targets, storeName) {
  for (const record of records) {
    if (record[field] && !targets.has(record[field])) invalid("integrity", `${storeName}.${field} has an unknown reference.`);
  }
}

function assertUnique(records, key, storeName) {
  const values = new Set();
  for (const record of records) {
    if (!record[key]) continue;
    if (values.has(record[key])) invalid("integrity", `${storeName}.${key} must be unique.`);
    values.add(record[key]);
  }
}

export function validateBackup(value, { expectedWorkspaceId } = {}) {
  if (!isRecord(value) || value.schema !== BACKUP_SCHEMA) invalid("version", "Backup schema is not supported.");
  if (!/^\d+\.\d+\.\d+(?:[-+].*)?$/u.test(value.appVersion ?? "") || Number(value.appVersion.split(".")[0]) > Number(APP_VERSION.split(".")[0])) {
    invalid("version", "Backup application version is not supported.");
  }
  if (!isRecord(value.data)) invalid("structure", "Backup data is missing.");
  for (const storeName of BACKUP_STORES) {
    if (!Array.isArray(value.data[storeName])) invalid("structure", `Backup collection is missing: ${storeName}.`);
  }
  if (!isRecord(value.media) || typeof value.media.included !== "boolean" || !Array.isArray(value.media.records)) {
    invalid("media", "Backup media manifest is invalid.");
  }
  if (value.media.included && value.media.records.length === 0) invalid("media", "embedded media records are required when media is included.");
  if (!value.media.included && value.media.records.length) invalid("media", "Media records require an included media manifest.");
  if (value.data.workspaces.length !== 1) invalid("structure", "Backup must contain exactly one workspace.");
  const workspace = value.data.workspaces[0];
  if (!isRecord(workspace) || typeof workspace.id !== "string" || !workspace.id) invalid("structure", "Workspace record is invalid.");
  if (value.workspaceId !== workspace.id) invalid("integrity", "Backup workspace identifiers do not match.");
  if (expectedWorkspaceId && expectedWorkspaceId !== workspace.id) invalid("conflict", "Backup belongs to a different workspace.");

  let totalRecords = 0;
  for (const storeName of BACKUP_STORES) {
    const ids = new Set();
    for (const record of value.data[storeName]) {
      if (!isRecord(record) || typeof record.id !== "string" || !record.id) invalid("structure", `${storeName} contains an invalid record.`);
      if (ids.has(record.id)) invalid("integrity", `${storeName} contains duplicate identifiers.`);
      ids.add(record.id);
      if (storeName !== "workspaces" && record.workspaceId !== workspace.id) invalid("integrity", `${storeName} crosses the workspace boundary.`);
      totalRecords += 1;
      if (totalRecords > MAX_BACKUP_RECORDS) invalid("size", "Backup contains too many records.");
    }
  }

  const ids = (storeName) => new Set(value.data[storeName].map(({ id }) => id));
  const products = ids("products");
  assertReference(value.data.products, "categoryId", ids("categories"), "products");
  assertReference(value.data.products, "supplierId", ids("suppliers"), "products");
  for (const storeName of ["productUnits", "batches", "movements"]) assertReference(value.data[storeName], "productId", products, storeName);
  assertReference(value.data.productRelations, "sourceProductId", products, "productRelations");
  assertReference(value.data.productRelations, "targetProductId", products, "productRelations");
  assertReference(value.data.kitItems, "kitId", ids("kits"), "kitItems");
  assertReference(value.data.kitItems, "productId", products, "kitItems");
  assertUnique(value.data.products, "nexCode", "products");
  assertUnique(value.data.productUnits, "serialNumber", "productUnits");
  assertUnique(value.data.batches.map((record) => ({ ...record, productBatch: `${record.productId}\u0000${record.batchNumber}` })), "productBatch", "batches");
  for (const record of value.media.records) {
    if (!isRecord(record) || !["id", "workspaceId", "productId", "altText", "mimeType", "contentBase64"].every((key) => typeof record[key] === "string" && record[key])) invalid("media", "Media record is invalid.");
    if (record.workspaceId !== workspace.id || !products.has(record.productId) || !/^image\/(?:jpeg|png|webp)$/u.test(record.mimeType) || !/^[A-Za-z0-9+/]+={0,2}$/u.test(record.contentBase64)) invalid("media", "Media record is invalid.");
  }

  return Object.freeze({
    backup: value,
    workspace,
    totalRecords,
    counts: Object.freeze(Object.fromEntries(BACKUP_STORES.map((name) => [name, value.data[name].length]))),
  });
}

export function parseBackupText(text, options = {}) {
  if (typeof text !== "string") invalid("structure", "Backup content must be text.");
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) invalid("size", "Backup file is too large.");
  let value;
  try { value = JSON.parse(text); }
  catch { invalid("structure", "Backup file is not valid JSON."); }
  return validateBackup(value, options);
}

export function serializeBackup(backup) {
  return JSON.stringify(backup, null, 2);
}

export class BackupService {
  constructor({ provider, mediaService, now = () => new Date() }) {
    if (!provider) throw new TypeError("BackupService requires a DataProvider.");
    this.provider = provider;
    this.mediaService = mediaService;
    this.now = now;
  }

  async create(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const workspace = await this.provider.get("workspaces", workspaceId);
    if (!workspace || workspace.id !== workspaceId) throw new RangeError("Workspace not found.");
    const entries = await Promise.all(BACKUP_STORES.slice(1).map(async (storeName) => {
      const records = await this.provider.getAll(storeName, { index: "workspaceId", query: workspaceId });
      return [storeName, storeName === "settings" ? records.filter((record) => !isLocalSnapshotSetting(record)) : records];
    }));
    const data = { workspaces: [workspace], ...Object.fromEntries(entries) };
    const mediaRecords = this.mediaService ? await serializeMedia(await this.mediaService.listByWorkspace(workspaceId)) : [];
    const backup = {
      schema: BACKUP_SCHEMA,
      appVersion: APP_VERSION,
      generatedAt: this.now().toISOString(),
      workspaceId,
      workspaceName: workspace.name,
      data,
      media: { included: Boolean(this.mediaService), records: mediaRecords },
    };
    const validation = validateBackup(backup, { expectedWorkspaceId: workspaceId });
    return Object.freeze({
      ...validation,
      filename: `nexstock-backup-${safeFilenamePart(workspace.name)}-${backup.generatedAt.slice(0, 10)}.json`,
      content: serializeBackup(backup),
    });
  }

  async inspect(workspaceId, text) {
    const current = await this.provider.get("workspaces", workspaceId);
    if (!current) throw new RangeError("Workspace not found.");
    const validation = parseBackupText(text, { expectedWorkspaceId: workspaceId });
    return Object.freeze({
      ...validation,
      expectedUpdatedAt: current.updatedAt,
      hasConflict: current.updatedAt !== validation.workspace.updatedAt,
      generatedAt: validation.backup.generatedAt,
    });
  }

  async restore(workspaceId, inspection) {
    if (!inspection?.backup || inspection.workspace.id !== workspaceId) invalid("conflict", "Backup preview is required before restore.");
    const validation = validateBackup(inspection.backup, { expectedWorkspaceId: workspaceId });
    const localSnapshots = (await this.provider.getAll("settings", { index: "workspaceId", query: workspaceId }))
      .filter(isLocalSnapshotSetting);
    const collections = Object.fromEntries(BACKUP_STORES.map((name) => [
      name,
      name === "settings"
        ? [...validation.backup.data[name].map((record) => structuredClone(record)), ...localSnapshots.map((record) => structuredClone(record))]
        : validation.backup.data[name].map((record) => structuredClone(record)),
    ]));
    await this.provider.replaceWorkspaceData({
      workspaceId,
      expectedUpdatedAt: inspection.expectedUpdatedAt,
      collections,
    });
    if (this.mediaService && validation.backup.media.included) {
      const currentMedia = await this.mediaService.listByWorkspace(workspaceId);
      await Promise.all(currentMedia.map(({ productId }) => this.mediaService.remove(workspaceId, productId)));
      for (const record of validation.backup.media.records) {
        await this.mediaService.setImage({ workspaceId, productId: record.productId, file: base64ToBlob(record.contentBase64, record.mimeType), altText: record.altText });
      }
    }
    return structuredClone(validation.workspace);
  }
}
