import test from "node:test";
import assert from "node:assert/strict";
import { clearFeedbackLayer, normalizeFeedbackTone } from "../../js/components/feedback.js";

test("feedback aceita apenas tons semânticos conhecidos", () => {
  for (const tone of ["info", "success", "warning", "danger"]) {
    assert.equal(normalizeFeedbackTone(tone), tone);
  }
  assert.throws(() => normalizeFeedbackTone("amber"), RangeError);
});

test("troca de idioma remove notificações no idioma anterior", () => {
  let cleared = false;
  clearFeedbackLayer({ replaceChildren() { cleared = true; } });
  assert.equal(cleared, true);
  assert.throws(() => clearFeedbackLayer(null), TypeError);
});
