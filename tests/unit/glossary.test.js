import test from "node:test";
import assert from "node:assert/strict";
import { GLOSSARY_TERMS } from "../../js/views/glossary-view.js";

test("glossário cobre a terminologia operacional central sem duplicações", () => {
  assert.deepEqual(GLOSSARY_TERMS, [
    "workspace", "nexCode", "minimumStock", "tracking", "nexPulse",
    "forecast", "stockMemory", "scenario", "archived",
  ]);
  assert.equal(new Set(GLOSSARY_TERMS).size, GLOSSARY_TERMS.length);
});
