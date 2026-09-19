import test from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../../js/core/events.js";

test("EventBus publica e permite cancelar inscrição", () => {
  const bus = new EventBus();
  const received = [];
  const unsubscribe = bus.on("product:created", (detail) => received.push(detail));
  bus.emit("product:created", { id: "one" });
  unsubscribe();
  bus.emit("product:created", { id: "two" });
  assert.deepEqual(received, [{ id: "one" }]);
});
