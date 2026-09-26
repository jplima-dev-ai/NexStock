import { normalizeSearchText } from "./product-service.js";

const PRODUCT_COMMANDS = Object.freeze([
  { operation: "entry", aliases: ["entrada", "entry", "in"] },
  { operation: "output", aliases: ["saida", "output", "withdrawal", "salida"] },
  { operation: "open", aliases: ["abrir", "open"] },
  { operation: "scenario", aliases: ["simular", "simulate"] },
]);

const NEX_QUERY_PATTERNS = Object.freeze([
  { id: "critical", filters: { status: "critical" }, patterns: [/^(?:(?:produtos?|productos?|products?) )?(?:criticos?|critical products?)$/u] },
  { id: "out", filters: { status: "out" }, patterns: [/^(?:(?:produtos?|productos?|products?) )?(?:sem estoque|sin existencias|esgotados?|out of stock)$/u] },
  { id: "attention", filters: { status: "attention" }, patterns: [/^(?:(?:produtos?|productos?|products?) )?(?:em atencao|en atencion|attention)$/u] },
  { id: "healthy", filters: { status: "healthy" }, patterns: [/^(?:(?:produtos?|productos?|products?) )?(?:saudaveis|saludables|healthy)$/u] },
  { id: "archived", filters: { archived: "archived" }, patterns: [/^(?:(?:produtos?|productos?|products?) )?(?:arquivados?|archived|archivados?)$/u] },
  { id: "serial", filters: { module: "serial" }, patterns: [/^(?:(?:produtos?|productos?) )?(?:com serial|con serial|serializados?)$|^serialized(?: products?)?$/u] },
  { id: "expiry", filters: { module: "expiry" }, patterns: [/^(?:(?:produtos?|productos?|products?) )?(?:com validade|con vencimiento|expiry)$/u] },
]);

export function parseNexQuery(query) {
  const normalized = normalizeSearchText(query).trim();
  if (!normalized) return null;
  const search = normalized.match(/^(?:buscar|buscar produtos?|buscar productos?|search(?: products?)?|buscar por)\s+(.+)$/u);
  if (search?.[1]?.trim()) return Object.freeze({ id: "search", filters: Object.freeze({ query: search[1].trim() }) });
  const matched = NEX_QUERY_PATTERNS.find(({ patterns }) => patterns.some((pattern) => pattern.test(normalized)));
  return matched ? Object.freeze({ id: matched.id, filters: Object.freeze({ ...matched.filters }) }) : null;
}

export function parseProductCommand(query) {
  const normalized = normalizeSearchText(query).trim();
  for (const command of PRODUCT_COMMANDS) {
    const alias = command.aliases.find((candidate) => normalized === candidate || normalized.startsWith(`${candidate} `));
    if (alias) return Object.freeze({ operation: command.operation, productQuery: normalized.slice(alias.length).trim() });
  }
  return Object.freeze({ operation: null, productQuery: normalized });
}

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
    const command = parseProductCommand(query);
    if (!command.productQuery) return [];
    return (await this.productService.search(workspaceId, { query: command.productQuery, archived: "active" })).slice(0, 8).map((product) => ({
      id: `product-${product.id}`, type: "product", label: `${product.name} · ${product.nexCode}`,
      description: product.categoryName, href: `#/products/${encodeURIComponent(product.id)}`, productId: product.id, operation: command.operation,
    }));
  }
}
