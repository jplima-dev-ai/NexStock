import { INITIAL_SCHEMA_VERSION, migrateToVersion1 } from "./001-initial-schema.js";
import { migrateToVersion2, PRODUCT_CODE_SCHEMA_VERSION } from "./002-product-workspace-code.js";
import { migrateToVersion3, MODULE_INTEGRITY_SCHEMA_VERSION } from "./003-module-integrity.js";
import { migrateToVersion4, PRODUCT_MEDIA_SCHEMA_VERSION } from "./004-product-media.js";

export const DATABASE_VERSION = PRODUCT_MEDIA_SCHEMA_VERSION;

export function runMigrations({ database, transaction, oldVersion }) {
  if (oldVersion < 1) migrateToVersion1(database, transaction);
  if (oldVersion < 2) migrateToVersion2(transaction);
  if (oldVersion < 3) migrateToVersion3(transaction);
  if (oldVersion < 4) migrateToVersion4(database, transaction);
}
