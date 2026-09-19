import { normalizeSearchText } from "./product-service.js";

export function filterGlobalItems(query, items) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return items;
  return items.filter((item) => normalizeSearchText(`${item.label} ${item.keywords ?? ""}`).includes(normalized));
}

export class GlobalSearchService {
  constructor({ productService }) {
    if (!productService) throw new TypeError("GlobalSearchService requires ProductService.");
    this.productService = productService;
  }

  async searchProducts(workspaceId, query) {
    if (!workspaceId || !String(query ?? "").trim()) return [];
    return (await this.productService.search(workspaceId, { query, archived: "active" })).slice(0, 8).map((product) => ({
      id: `product-${product.id}`, type: "product", label: `${product.name} · ${product.nexCode}`,
      description: product.categoryName, href: `#/products/${encodeURIComponent(product.id)}`,
    }));
  }
}
