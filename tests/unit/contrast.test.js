import test from "node:test";
import assert from "node:assert/strict";

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/giu).map((channel) => Number.parseInt(channel, 16) / 255);
  const linear = channels.map((channel) => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first, second) {
  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
}

test("texto principal atende contraste AA nos dois temas", () => {
  assert.ok(contrastRatio("#0F172A", "#F6F8FC") >= 4.5);
  assert.ok(contrastRatio("#F8FAFC", "#0B1120") >= 4.5);
});

test("texto de ação contrasta com o fundo primário nos dois temas", () => {
  assert.ok(contrastRatio("#FFFFFF", "#1D4ED8") >= 4.5);
  assert.ok(contrastRatio("#0B1120", "#60A5FA") >= 4.5);
});

test("cores secundárias de texto atendem contraste AA", () => {
  assert.ok(contrastRatio("#475569", "#F6F8FC") >= 4.5);
  assert.ok(contrastRatio("#CBD5E1", "#0B1120") >= 4.5);
});

test("indicadores de foco atingem contraste não textual mínimo", () => {
  assert.ok(contrastRatio("#0E7490", "#FFFFFF") >= 3);
  assert.ok(contrastRatio("#22D3EE", "#111827") >= 3);
});

test("ações destrutivas mantêm contraste textual nos dois temas", () => {
  assert.ok(contrastRatio("#FFFFFF", "#B91C1C") >= 4.5);
  assert.ok(contrastRatio("#111827", "#F87171") >= 4.5);
});

test("ações secundárias mantêm contraste nos dois temas", () => {
  assert.ok(contrastRatio("#1D4ED8", "#FFFFFF") >= 4.5);
  assert.ok(contrastRatio("#60A5FA", "#111827") >= 4.5);
});
