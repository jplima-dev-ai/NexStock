function isMessageCatalog(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function findMessage(catalog, key) {
  let current = catalog;
  for (const segment of key.split(".")) {
    if (!isMessageCatalog(current) || !Object.hasOwn(current, segment)) return undefined;
    current = current[segment];
  }
  return typeof current === "string" ? current : undefined;
}

export function interpolateMessage(message, parameters = {}) {
  return message.replace(/\{([a-zA-Z][\w]*)\}/gu, (placeholder, name) => (
    Object.hasOwn(parameters, name) ? String(parameters[name]) : placeholder
  ));
}

export function createLocaleLoader(basePath = "./locales") {
  return async (locale) => {
    const response = await fetch(`${basePath}/${locale}.json`);
    if (!response.ok) throw new Error(`Locale unavailable: ${locale}`);
    const catalog = await response.json();
    if (!isMessageCatalog(catalog)) throw new TypeError(`Invalid locale catalog: ${locale}`);
    return catalog;
  };
}

export class I18n {
  #catalogs = new Map();
  #loader;

  constructor({ defaultLocale, supportedLocales, loader }) {
    if (!supportedLocales.includes(defaultLocale)) {
      throw new RangeError("The default locale must be supported.");
    }
    this.defaultLocale = defaultLocale;
    this.supportedLocales = Object.freeze([...supportedLocales]);
    this.locale = defaultLocale;
    this.#loader = loader;
  }

  async #load(locale) {
    if (!this.#catalogs.has(locale)) {
      const catalog = await this.#loader(locale);
      if (!isMessageCatalog(catalog)) throw new TypeError(`Invalid locale catalog: ${locale}`);
      this.#catalogs.set(locale, catalog);
    }
  }

  async init(locale = this.defaultLocale) {
    await this.#load(this.defaultLocale);
    await this.setLocale(locale);
    return this;
  }

  async setLocale(locale) {
    if (!this.supportedLocales.includes(locale)) {
      throw new RangeError(`Locale not supported: ${locale}`);
    }
    await this.#load(locale);
    this.locale = locale;
    return locale;
  }

  t(key, parameters) {
    const activeMessage = findMessage(this.#catalogs.get(this.locale), key);
    const fallbackMessage = findMessage(this.#catalogs.get(this.defaultLocale), key);
    return interpolateMessage(activeMessage ?? fallbackMessage ?? key, parameters);
  }
}
