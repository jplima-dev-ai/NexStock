const COMPONENT_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/u;

export function assertComponentId(id) {
  if (typeof id !== "string" || !COMPONENT_ID_PATTERN.test(id)) {
    throw new TypeError("Component id must begin with a letter and contain only letters, numbers, hyphens, or underscores.");
  }
  return id;
}
