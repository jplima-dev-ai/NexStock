export const DEMO_PROFILES = Object.freeze(["technology", "cosmetics", "fashion", "food", "custom"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateDemoSeed(seed, expectedProfileKey) {
  if (!seed || typeof seed !== "object" || Array.isArray(seed)) throw new TypeError("Invalid demo seed.");
  if (seed.profileKey !== expectedProfileKey) throw new TypeError("Demo seed profile does not match.");
  if (!isNonEmptyString(seed.workspace?.name)) throw new TypeError("Demo seed requires a workspace name.");
  for (const collection of ["categories", "suppliers", "products"]) {
    if (!Array.isArray(seed[collection])) throw new TypeError(`Demo seed requires ${collection}.`);
  }
  const categoryKeys = new Set(seed.categories.map((item) => item.key));
  const supplierKeys = new Set(seed.suppliers.map((item) => item.key));
  for (const product of seed.products) {
    if (!isNonEmptyString(product.key) || !isNonEmptyString(product.name)) {
      throw new TypeError("Every seed product requires a key and name.");
    }
    if (product.categoryKey && !categoryKeys.has(product.categoryKey)) {
      throw new TypeError(`Unknown seed category: ${product.categoryKey}`);
    }
    if (product.supplierKey && !supplierKeys.has(product.supplierKey)) {
      throw new TypeError(`Unknown seed supplier: ${product.supplierKey}`);
    }
  }
  return seed;
}

export function createSeedLoader(basePath = "./demo") {
  return async (profileKey) => {
    if (!DEMO_PROFILES.includes(profileKey)) throw new RangeError(`Demo profile not supported: ${profileKey}`);
    const response = await fetch(`${basePath}/${profileKey}.json`);
    if (!response.ok) throw new Error(`Demo seed unavailable: ${profileKey}`);
    return validateDemoSeed(await response.json(), profileKey);
  };
}
