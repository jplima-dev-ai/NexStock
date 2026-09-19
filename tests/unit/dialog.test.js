import test from "node:test";
import assert from "node:assert/strict";
import { FOCUSABLE_SELECTOR } from "../../js/components/dialog.js";

test("dialog reconhece controles nativos e exclui tabindex menos um", () => {
  assert.match(FOCUSABLE_SELECTOR, /button:not/u);
  assert.match(FOCUSABLE_SELECTOR, /a\[href\]/u);
  assert.match(FOCUSABLE_SELECTOR, /tabindex='-1'/u);
});
