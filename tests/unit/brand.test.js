import test from "node:test";
import assert from "node:assert/strict";
import { getBrandAsset } from "../../js/components/brand.js";

test("metadados de marca preservam dimensões intrínsecas", () => {
  assert.deepEqual(
    { width: getBrandAsset("mainLogo").width, height: getBrandAsset("mainLogo").height },
    { width: 1920, height: 1080 },
  );
  assert.deepEqual(
    { width: getBrandAsset("mascot").width, height: getBrandAsset("mascot").height },
    { width: 1200, height: 1600 },
  );
});

test("asset desconhecido é rejeitado", () => {
  assert.throws(() => getBrandAsset("unknown"), RangeError);
});
