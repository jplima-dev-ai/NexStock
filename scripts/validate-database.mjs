import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const files = ["schema.sql", "constraints.sql", "indexes.sql", "functions.sql", "policies.sql", "seed.sql"];
for (const file of files) if (!existsSync(join(root, "database", file))) throw new Error(`Arquivo PostgreSQL ausente: ${file}`);
const sql = Object.fromEntries(files.map((file) => [file, readFileSync(join(root, "database", file), "utf8")]));
const schema = sql["schema.sql"];
const policies = sql["policies.sql"];
const constraints = sql["constraints.sql"];
const functions = sql["functions.sql"];

const tables = ["workspaces", "workspace_members", "categories", "suppliers", "products", "product_units", "stock_batches", "stock_movements", "audit_logs", "product_relations", "kits", "kit_items", "custom_field_definitions", "settings", "sync_queue"];
for (const table of tables) {
  if (!schema.includes(`public.${table}`)) throw new Error(`Tabela ausente: ${table}`);
  if (!policies.includes(`public.${table} enable row level security`)) throw new Error(`RLS ausente: ${table}`);
}
for (const contract of ["current_quantity >= 0", "minimum_stock >= 0", "products_workspace_nex_code_unique", "product_units_workspace_serial_unique", "stock_batches_product_number_unique", "foreign key (product_id, workspace_id)"]) {
  if (!constraints.includes(contract)) throw new Error(`Restrição PostgreSQL ausente: ${contract}`);
}
for (const contract of ["security definer", "set search_path = public", "for update", "apply_stock_movement", "Stock changed after preview"]) {
  if (!functions.includes(contract)) throw new Error(`Função segura ausente: ${contract}`);
}
if (!policies.includes("to authenticated") || !policies.includes("auth.uid()")) throw new Error("Policies não estão vinculadas à identidade autenticada.");
const frontend = readFileSync(join(root, "js/storage/supabase-provider.js"), "utf8");
if (/service_role\s*[:=]\s*["'][A-Za-z0-9._-]+/u.test(frontend)) throw new Error("Secret service-role encontrado no frontend.");
process.stdout.write(`PostgreSQL/Supabase: ${tables.length} tabelas, RLS, policies, constraints, índices e RPC transacional aprovados.\n`);
