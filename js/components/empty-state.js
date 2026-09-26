import { createCard } from "./card.js";

const EMPTY_STATE_KINDS = new Set(["first-use", "filtered", "positive", "unavailable", "insufficient-data"]);

export function normalizeEmptyStateKind(kind = "insufficient-data") {
  if (!EMPTY_STATE_KINDS.has(kind)) throw new RangeError(`Empty state kind not supported: ${kind}`);
  return kind;
}

export function createEmptyState({ title, description, action, illustration, kind = "insufficient-data" } = {}) {
  if (!title || !description) throw new TypeError("EmptyState requires title and description.");
  const content = document.createElement("div");
  content.className = "ns-empty-state";
  content.dataset.emptyState = normalizeEmptyStateKind(kind);
  if (illustration instanceof Node) {
    illustration.alt = "";
    content.append(illustration);
  }
  const text = document.createElement("p");
  text.textContent = description;
  content.append(text);
  if (action instanceof Node) {
    const actions = document.createElement("div");
    actions.className = "ns-empty-state__actions";
    actions.append(action);
    content.append(actions);
  }
  return createCard({ title, content });
}
