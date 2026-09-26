import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
for (const file of ["js/services/media-service.js", "js/storage/media-provider.js", "js/storage/migrations/004-product-media.js", "tests/unit/media-service.test.js", "tests/e2e/product-media.spec.js", "docs/project/cycle-039-phase-39.md"]) {
  if (!existsSync(join(ROOT, file))) throw new Error(`Fase 39 sem artefato obrigatório: ${file}`);
}
const service = readFileSync(join(ROOT, "js/services/media-service.js"), "utf8");
for (const contract of ["MAX_IMAGE_BYTES", "IMAGE_TYPES", "validateImageFile", "thumbnailFor", "altText", "Blob"]) if (!service.includes(contract)) throw new Error(`Product Media sem contrato: ${contract}`);
const provider = readFileSync(join(ROOT, "js/storage/media-provider.js"), "utf8");
for (const contract of ["MediaProvider", "IndexedDBMediaProvider", "SupabaseMediaProvider", "getByProduct"]) if (!provider.includes(contract)) throw new Error(`MediaProvider sem contrato: ${contract}`);
const productView = readFileSync(join(ROOT, "js/views/product-view.js"), "utf8");
for (const contract of ["product-image", "product-image-alt", "createMediaPreview", "removeMedia"]) if (!productView.includes(contract)) throw new Error(`Interface de mídia incompleta: ${contract}`);
const backup = readFileSync(join(ROOT, "js/services/backup-service.js"), "utf8");
for (const contract of ["serializeMedia", "contentBase64", "mediaService"]) if (!backup.includes(contract)) throw new Error(`Backup não integra mídia: ${contract}`);
for (const locale of ["pt-BR", "en-US", "es"]) {
  const catalog = JSON.parse(readFileSync(join(ROOT, "locales", `${locale}.json`), "utf8"));
  for (const key of ["fileLabel", "altLabel", "altHelp", "removeLabel"]) if (!catalog.productMedia?.[key]) throw new Error(`${locale}: texto de mídia ausente: ${key}.`);
}
const worker = readFileSync(join(ROOT, "service-worker.js"), "utf8");
for (const cached of ["media-service.js", "media-provider.js", "004-product-media.js"]) if (!worker.includes(cached)) throw new Error(`Cache offline não cobre: ${cached}`);
if (!/phase(?:39|[4-9][0-9])/u.test(worker)) throw new Error("Cache offline não preserva a evolução posterior à fase 39.");
process.stdout.write("Fase 39: imagem opcional, descrição acessível, Blob local, thumbnail e backup aprovados.\n");
