import { APP_CONFIG } from "./config.js";

export const ROUTES = Object.freeze([
  { pattern: "/welcome", messageKey: "welcome" },
  { pattern: "/tour", messageKey: "tour" },
  { pattern: "/onboarding", messageKey: "onboarding" },
  { pattern: "/dashboard", messageKey: "dashboard" },
  { pattern: "/products", messageKey: "products" },
  { pattern: "/products/new", messageKey: "productNew" },
  { pattern: "/products/:id/edit", messageKey: "productEdit" },
  { pattern: "/products/:id", messageKey: "productDetail" },
  { pattern: "/movements", messageKey: "movements" },
  { pattern: "/radar", messageKey: "radar" },
  { pattern: "/insights", messageKey: "insights" },
  { pattern: "/time-machine", messageKey: "timeMachine" },
  { pattern: "/scenario", messageKey: "scenario" },
  { pattern: "/kits", messageKey: "kits" },
  { pattern: "/about", messageKey: "about" },
  { pattern: "/settings", messageKey: "settings" },
  { pattern: "/settings/profiles", messageKey: "profiles" },
  { pattern: "/settings/security", messageKey: "security" },
  { pattern: "/shield-test", messageKey: "shieldTest" },
]);

export function normalizeRoute(hash = "") {
  const rawRoute = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!rawRoute || rawRoute === "/") return APP_CONFIG.defaultRoute;
  const withLeadingSlash = rawRoute.startsWith("/") ? rawRoute : `/${rawRoute}`;
  return withLeadingSlash.replace(/\/+$/, "") || APP_CONFIG.defaultRoute;
}

function matchPattern(pattern, route) {
  const patternParts = pattern.split("/").filter(Boolean);
  const routeParts = route.split("/").filter(Boolean);
  if (patternParts.length !== routeParts.length) return null;

  const params = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const routePart = routeParts[index];
    if (patternPart.startsWith(":")) {
      if (!routePart) return null;
      try {
        params[patternPart.slice(1)] = decodeURIComponent(routePart);
      } catch {
        return null;
      }
    } else if (patternPart !== routePart) {
      return null;
    }
  }
  return params;
}

export function resolveRoute(route) {
  for (const definition of ROUTES) {
    const params = matchPattern(definition.pattern, route);
    if (params) return { ...definition, params, route };
  }
  return null;
}

export class Router {
  constructor({ onRouteChange, onNotFound }) {
    this.onRouteChange = onRouteChange;
    this.onNotFound = onNotFound;
    this.handleChange = this.handleChange.bind(this);
  }

  start() {
    window.addEventListener("hashchange", this.handleChange);
    this.handleChange();
  }

  stop() {
    window.removeEventListener("hashchange", this.handleChange);
  }

  handleChange() {
    this.refresh();
  }

  refresh(context = { moveFocus: true }) {
    const route = normalizeRoute(window.location.hash);
    const match = resolveRoute(route);
    if (match) this.onRouteChange(match, context);
    else this.onNotFound({ route }, context);
  }
}
