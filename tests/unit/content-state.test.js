import test from "node:test";
import assert from "node:assert/strict";
import { normalizeContentStateKind } from "../../js/components/content-state.js";
import { normalizeEmptyStateKind } from "../../js/components/empty-state.js";

test("NexCopy aceita somente estados de conteúdo explícitos", () => {
  for (const kind of ["loading", "offline", "success", "warning", "error"]) {
    assert.equal(normalizeContentStateKind(kind), kind);
  }
  assert.throws(() => normalizeContentStateKind("busy"), /not supported/);
});

test("NexCopy classifica estados vazios conforme o blueprint", () => {
  for (const kind of ["first-use", "filtered", "positive", "unavailable", "insufficient-data"]) {
    assert.equal(normalizeEmptyStateKind(kind), kind);
  }
  assert.throws(() => normalizeEmptyStateKind("generic"), /not supported/);
});
