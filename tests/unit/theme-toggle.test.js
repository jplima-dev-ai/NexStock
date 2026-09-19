import test from "node:test";
import assert from "node:assert/strict";
import { getThemeToggleKey } from "../../js/components/theme-toggle.js";

test("tema oferece a chave traduzível da ação inversa", () => {
  assert.equal(getThemeToggleKey("light"), "theme.useDark");
  assert.equal(getThemeToggleKey("dark"), "theme.useLight");
});
