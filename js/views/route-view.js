import { createBrandImage, createBrandLockup } from "../components/brand.js";
import { createButton } from "../components/button.js";
import { createCard } from "../components/card.js";
import { createEmptyState } from "../components/empty-state.js";
import { createAlert } from "../components/feedback.js";
import { createOnboardingView } from "./onboarding-view.js";
import { createDashboardView, createRadarView } from "./dashboard-view.js";
import { createInsightsView } from "./insight-view.js";
import { createMovementView } from "./movement-view.js";
import { createProductRouteView } from "./product-view.js";
import { createScenarioView, createTimeMachineView } from "./scenario-view.js";
import { createCustomFieldView } from "./custom-field-view.js";
import { createModuleView } from "./module-view.js";
import { createSecurityCenterView, createShieldTestView } from "./security-view.js";
import { createTourView } from "./tour-view.js";
import { createSettingsView } from "./settings-view.js";

function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

export function getWelcomeArtwork(locale) {
  if (locale === "pt-BR") return "hero";
  return locale === "en-US" ? "mascot" : "symbol";
}

function createWelcomeView({ title, t, locale }) {
  const section = document.createElement("section");
  section.className = "welcome-view";
  section.setAttribute("aria-labelledby", "route-title");

  const intro = document.createElement("div");
  intro.className = "welcome-intro";

  const copy = document.createElement("header");
  copy.className = "welcome-copy";
  copy.append(createBrandLockup({ variant: "main" }));

  const heading = createTextElement("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  copy.append(
    heading,
    createTextElement("p", t("app.slogan"), "brand-slogan"),
    createTextElement("p", t("welcome.intro")),
  );

  const actions = document.createElement("div");
  actions.className = "welcome-actions";
  actions.append(
    createButton({ text: t("welcome.configure"), href: "#/onboarding" }),
    createButton({ text: t("welcome.tour"), href: "#/tour", variant: "secondary" }),
    createButton({ text: t("welcome.about"), href: "#/about", variant: "secondary" }),
  );
  copy.append(actions);

  intro.append(
    copy,
    createBrandImage(getWelcomeArtwork(locale), {
      decorative: true,
      ...(locale === "pt-BR" ? { fetchPriority: "high" } : { loading: "lazy" }),
    }),
  );
  section.append(intro);
  return { element: section, focusTarget: heading };
}

function createInstitutionalView({ title, description, route, t }) {
  const section = document.createElement("section");
  section.className = "institutional-view";
  section.setAttribute("aria-labelledby", "route-title");

  const visual = document.createElement("div");
  visual.className = "institutional-visual";
  visual.append(
    createBrandLockup({
      variant: "stacked",
      slogan: t("app.slogan"),
    }),
    createBrandImage(route === "/onboarding" ? "mascot" : "symbol", {
      decorative: true,
      loading: "lazy",
    }),
  );

  const copy = document.createElement("div");
  copy.className = "institutional-copy";
  const heading = createTextElement("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  copy.append(
    heading,
    createTextElement("p", description),
    createTextElement(
      "p",
      route === "/onboarding"
        ? t("institutional.onboardingStatus")
        : t("institutional.aboutStatus"),
      "route-meta",
    ),
  );

  section.append(visual, copy);
  return { element: section, focusTarget: heading };
}

export function createRouteView({
  title,
  description,
  route,
  isNotFound = false,
  t,
  locale,
  currentWorkspace,
  persistenceReady,
  onboardingState,
  onOnboardingStateChange,
  onCreateWorkspace,
  params,
  productService,
  onProductSaved,
  onProductArchived,
  movementService,
  movementProductId,
  movementType,
  productFilterPreset,
  onMoveProduct,
  onMovementSaved,
  dashboardService,
  insightService,
  customFieldService,
  moduleService,
  securityService,
  draftService,
  onCriticalOperationChange,
  onResetWorkspace,
}) {
  if (route === "/welcome") return createWelcomeView({ title, t, locale });
  if (route === "/tour") return createTourView({ title, description, t });
  if (route === "/onboarding") {
    return createOnboardingView({
      title,
      description,
      t,
      locale,
      currentWorkspace,
      persistenceReady,
      initialState: onboardingState,
      onStateChange: onOnboardingStateChange,
      onComplete: onCreateWorkspace,
    });
  }
  if (route === "/about") {
    return createInstitutionalView({ title, description, route, t });
  }

  if (route.startsWith("/products")) {
    return createProductRouteView({ title, description, route, params, t, locale, currentWorkspace, workspace: currentWorkspace, service: productService, movementService, insightService, draftService, onMoveProduct, onSaved: onProductSaved, onArchived: onProductArchived, initialFilters: productFilterPreset });
  }
  if (route === "/movements") return createMovementView({ title, description, t, locale, workspace: currentWorkspace, productService, movementService, draftService, initialProductId: movementProductId, initialType: movementType, onSaved: onMovementSaved, onCriticalOperationChange });
  if (route === "/dashboard") return createDashboardView({ title, description, t, locale, workspace: currentWorkspace, service: dashboardService });
  if (route === "/radar") return createRadarView({ title, description, t, workspace: currentWorkspace, service: dashboardService });
  if (route === "/insights") return createInsightsView({ title, description, t, locale, workspace: currentWorkspace, service: insightService });
  if (route === "/scenario") return createScenarioView({ title, description, t, locale, workspace: currentWorkspace, productService, movementService });
  if (route === "/time-machine") return createTimeMachineView({ title, description, t, locale, workspace: currentWorkspace, insightService });
  if (route === "/settings/profiles") return createCustomFieldView({ title, description, t, workspace: currentWorkspace, service: customFieldService });
  if (route === "/kits") return createModuleView({ title, description, t, workspace: currentWorkspace, service: moduleService });
  if (route === "/settings/security") return createSecurityCenterView({ title, description, t, service: securityService });
  if (route === "/shield-test") return createShieldTestView({ title, description, t, service: securityService });
  if (route === "/settings") return createSettingsView({ title, description, t, workspace: currentWorkspace, persistenceReady, onReset: onResetWorkspace });

  const section = document.createElement("section");
  section.className = "route-panel";
  section.setAttribute("aria-labelledby", "route-title");

  const heading = document.createElement("h1");
  heading.id = "route-title";
  heading.tabIndex = -1;
  heading.textContent = title;

  const summary = document.createElement("p");
  summary.textContent = description;

  const message = isNotFound
    ? createAlert({
      title: t("errors.unavailableTitle"),
      message: t("errors.unavailableMessage", { route }),
      tone: "warning",
    })
    : createCard({
      title: t("common.preparedTitle"),
      description: t("common.preparedDescription", { route }),
    });

  section.append(heading, summary, message);
  return { element: section, focusTarget: heading };
}
