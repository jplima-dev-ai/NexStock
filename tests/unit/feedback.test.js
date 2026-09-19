import test from "node:test";
import assert from "node:assert/strict";
import { normalizeFeedbackTone } from "../../js/components/feedback.js";

test("feedback aceita apenas tons semânticos conhecidos", () => {
  for (const tone of ["info", "success", "warning", "danger"]) {
    assert.equal(normalizeFeedbackTone(tone), tone);
  }
  assert.throws(() => normalizeFeedbackTone("amber"), RangeError);
});
