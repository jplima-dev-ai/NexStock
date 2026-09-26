export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp"]);

function text(value, field, maxLength = 240) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.length > maxLength) throw new TypeError(`${field} is invalid.`);
  return normalized;
}

export function validateImageFile(file) {
  if (!file || typeof file !== "object" || !IMAGE_TYPES.includes(file.type) || !Number.isFinite(file.size) || file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    throw new TypeError("Image file is invalid.");
  }
  return file;
}

async function thumbnailFor(file) {
  if (typeof globalThis.createImageBitmap !== "function" || !globalThis.document?.createElement) return file;
  try {
    const bitmap = await globalThis.createImageBitmap(file);
    const scale = Math.min(1, 320 / Math.max(bitmap.width, bitmap.height));
    const canvas = globalThis.document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close?.();
    return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob ?? file), "image/webp", 0.82));
  } catch { return file; }
}

export class MediaService {
  constructor({ mediaProvider, idFactory = () => globalThis.crypto.randomUUID(), now = () => new Date().toISOString() }) {
    if (!mediaProvider) throw new TypeError("MediaService requires a MediaProvider.");
    this.mediaProvider = mediaProvider; this.idFactory = idFactory; this.now = now;
  }
  async getByProduct(workspaceId, productId) { return this.mediaProvider.getByProduct(workspaceId, productId); }
  async setImage({ workspaceId, productId, file, altText }) {
    validateImageFile(file);
    const previous = await this.getByProduct(workspaceId, productId);
    const record = { id: previous?.id ?? this.idFactory(), workspaceId, productId, altText: text(altText, "Image description"), mimeType: file.type, blob: file, thumbnailBlob: await thumbnailFor(file), updatedAt: this.now() };
    await this.mediaProvider.put(record); return record;
  }
  async updateAltText({ workspaceId, productId, altText }) {
    const current = await this.getByProduct(workspaceId, productId);
    if (!current) throw new RangeError("Product media not found.");
    const record = { ...current, altText: text(altText, "Image description"), updatedAt: this.now() };
    await this.mediaProvider.put(record); return record;
  }
  async remove(workspaceId, productId) { await this.mediaProvider.deleteByProduct(workspaceId, productId); }
  async listByWorkspace(workspaceId) { return this.mediaProvider.listByWorkspace(workspaceId); }
}
