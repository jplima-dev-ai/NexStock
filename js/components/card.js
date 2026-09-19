const ALLOWED_HEADING_LEVELS = new Set([2, 3, 4]);

function appendContent(container, content) {
  if (content instanceof Node) container.append(content);
  else if (content !== undefined && content !== null) container.append(String(content));
}

export function createCard({ title, description, content, actions, headingLevel = 2 } = {}) {
  if (!ALLOWED_HEADING_LEVELS.has(headingLevel)) throw new RangeError("Card heading level must be 2, 3, or 4.");
  const article = document.createElement("article");
  article.className = "ns-card";
  if (title) {
    const heading = document.createElement(`h${headingLevel}`);
    heading.className = "ns-card__title";
    heading.textContent = title;
    article.append(heading);
  }
  if (description) {
    const summary = document.createElement("p");
    summary.className = "ns-card__description";
    summary.textContent = description;
    article.append(summary);
  }
  if (content !== undefined) {
    const body = document.createElement("div");
    body.className = "ns-card__body";
    appendContent(body, content);
    article.append(body);
  }
  if (actions) {
    const footer = document.createElement("footer");
    footer.className = "ns-card__actions";
    appendContent(footer, actions);
    article.append(footer);
  }
  return article;
}

export function createMetricCard({ label, value, context } = {}) {
  const content = document.createElement("div");
  content.className = "ns-metric";
  const valueElement = document.createElement("p");
  valueElement.className = "ns-metric__value";
  valueElement.textContent = String(value ?? "—");
  content.append(valueElement);
  if (context) {
    const contextElement = document.createElement("p");
    contextElement.className = "ns-metric__context";
    contextElement.textContent = context;
    content.append(contextElement);
  }
  return createCard({ title: label, content, headingLevel: 3 });
}
