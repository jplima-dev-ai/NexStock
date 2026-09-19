import test from "node:test";
import assert from "node:assert/strict";
import { getWelcomeArtwork } from "../../js/views/route-view.js";

test("Brand Scene com texto gravado aparece somente em pt-BR", () => {
  assert.equal(getWelcomeArtwork("pt-BR"), "hero");
  assert.equal(getWelcomeArtwork("en-US"), "mascot");
  assert.equal(getWelcomeArtwork("es"), "symbol");
});
