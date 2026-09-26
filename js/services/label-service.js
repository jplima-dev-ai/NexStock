const LABEL_TYPES = new Set(["product", "batch", "location", "unit"]);

export const NEX_LABEL_TYPES = Object.freeze([...LABEL_TYPES]);

export function buildLabelCode(nexCode) {
  const code = String(nexCode ?? "").trim().toUpperCase();
  if (!code) throw new TypeError("NexCode is required for a label.");
  return `NXL|${code}`;
}

function active(records) { return records.filter((record) => !record.archivedAt); }

function labelFor(product, type, detail = "") {
  return Object.freeze({
    id: `${type}:${product.id}:${detail || product.nexCode}`,
    type, productId: product.id, productName: product.name, nexCode: product.nexCode,
    location: product.location || "", detail: String(detail ?? ""), code: buildLabelCode(product.nexCode),
  });
}

export class LabelService {
  constructor({ provider }) { if (!provider) throw new TypeError("LabelService requires a DataProvider."); this.provider = provider; }

  async getOptions(workspaceId) {
    if (!workspaceId) throw new TypeError("A workspace ID is required.");
    const [products, batches, units] = await Promise.all([
      this.provider.getAll("products", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("batches", { index: "workspaceId", query: workspaceId }),
      this.provider.getAll("productUnits", { index: "workspaceId", query: workspaceId }),
    ]);
    const productMap = new Map(active(products).map((product) => [product.id, product]));
    return Object.freeze({
      products: Object.freeze([...productMap.values()].sort((a, b) => a.name.localeCompare(b.name))),
      batches: Object.freeze(active(batches).filter((batch) => productMap.has(batch.productId)).map((batch) => ({ ...batch, product: productMap.get(batch.productId) }))),
      units: Object.freeze(active(units).filter((unit) => productMap.has(unit.productId)).map((unit) => ({ ...unit, product: productMap.get(unit.productId) }))),
      locations: Object.freeze([...new Set([...productMap.values()].map(({ location }) => String(location ?? "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))),
    });
  }

  async prepare(workspaceId, { type = "product", target = "" } = {}) {
    if (!LABEL_TYPES.has(type)) throw new RangeError("Label type is not supported.");
    const options = await this.getOptions(workspaceId);
    if (!target) throw new TypeError("A label target is required.");
    if (type === "product") {
      const product = options.products.find(({ id }) => id === target);
      return Object.freeze(product ? [labelFor(product, type)] : []);
    }
    if (type === "batch") {
      const batch = options.batches.find(({ id }) => id === target);
      return Object.freeze(batch ? [labelFor(batch.product, type, batch.batchNumber)] : []);
    }
    if (type === "unit") {
      const unit = options.units.find(({ id }) => id === target);
      return Object.freeze(unit ? [labelFor(unit.product, type, unit.serialNumber)] : []);
    }
    return Object.freeze(options.products.filter(({ location }) => location === target).map((product) => labelFor(product, type, target)));
  }
}
