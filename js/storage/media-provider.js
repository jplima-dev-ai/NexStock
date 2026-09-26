export class MediaProvider {
  async getByProduct() { throw new Error("MediaProvider.getByProduct must be implemented."); }
  async put() { throw new Error("MediaProvider.put must be implemented."); }
  async deleteByProduct() { throw new Error("MediaProvider.deleteByProduct must be implemented."); }
  async listByWorkspace() { throw new Error("MediaProvider.listByWorkspace must be implemented."); }
}

export class IndexedDBMediaProvider extends MediaProvider {
  constructor({ provider }) { super(); if (!provider) throw new TypeError("IndexedDBMediaProvider requires a DataProvider."); this.provider = provider; }
  async getByProduct(workspaceId, productId) { return (await this.provider.getAll("media", { index: "productId", query: productId })).find((item) => item.workspaceId === workspaceId) ?? null; }
  async put(record) { return this.provider.put("media", record); }
  async deleteByProduct(workspaceId, productId) { const media = await this.getByProduct(workspaceId, productId); if (media) await this.provider.delete("media", media.id); }
  async listByWorkspace(workspaceId) { return this.provider.getAll("media", { index: "workspaceId", query: workspaceId }); }
}

export class SupabaseMediaProvider extends IndexedDBMediaProvider {}

export function createMediaProvider({ provider, type = "indexeddb" }) {
  return type === "supabase" ? new SupabaseMediaProvider({ provider }) : new IndexedDBMediaProvider({ provider });
}
