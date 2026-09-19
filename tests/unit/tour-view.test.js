import test from "node:test";
import assert from "node:assert/strict";
import { TOUR_STEPS } from "../../js/views/tour-view.js";

test("Demo Tour segue as seis etapas e a ordem do blueprint", () => {
  assert.deepEqual(TOUR_STEPS.map(({ id }) => id), ["pulse", "products", "insight", "scenario", "profiles", "shield"]);
  assert.equal(Object.isFrozen(TOUR_STEPS), true);
});
