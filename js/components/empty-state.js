import { createCard } from "./card.js";

export function createEmptyState({ title, description, action, illustration } = {}) {
  if (!title || !description) throw new TypeError("EmptyState requires title and description.");
  const content = document.createElement("div");
  content.className = "ns-empty-state";
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
