import test from "node:test";
import assert from "node:assert/strict";
import { createCopyContext, normalizeCopyProfile, normalizeExperienceMode } from "../../js/services/copy-service.js";

const translate = (key) => `translated:${key}`;

test("NexCopy guiado usa exemplo específico do perfil", () => {
  const copy = createCopyContext({ translate, workspace: { experienceMode: "guided", profileKey: "food" } });
  assert.equal(copy.mode, "guided");
  assert.deepEqual(copy.field({ helpKey: "help", exampleKey: "generic", profileExample: "productName" }), {
    helpText: "translated:help",
    exampleText: "translated:nexCopy.profileExamples.food.productName",
  });
  assert.equal(copy.explanation("detail"), "translated:detail");
});

test("NexCopy compacto preserva ajuda essencial e reduz conteúdo adicional", () => {
  const copy = createCopyContext({ translate, workspace: { experienceMode: "compact", profileKey: "technology" } });
  assert.deepEqual(copy.field({ helpKey: "help", exampleKey: "example" }), {
    helpText: "translated:help",
    exampleText: "",
  });
  assert.equal(copy.explanation("detail"), "");
});

test("modo e perfil desconhecidos usam fallbacks seguros", () => {
  assert.equal(normalizeExperienceMode("unknown"), "guided");
  assert.equal(normalizeCopyProfile("unknown"), "custom");
});
