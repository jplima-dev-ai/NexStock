export const ALLOWED_URL_PROTOCOLS = Object.freeze(["http:", "https:"]);

export function assertSafeUrl(value) {
  const url = new URL(String(value));
  if (!ALLOWED_URL_PROTOCOLS.includes(url.protocol)) throw new TypeError("URL protocol is not allowed.");
  return url.href;
}

export function untrustedText(value) {
  return Object.freeze({ value: String(value ?? ""), insertionMode: "textContent" });
}
