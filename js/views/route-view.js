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
import { createDigitalTwinView, createScenarioView, createTimeMachineView } from "./scenario-view.js";
import { createModuleView } from "./module-view.js";
import { createShieldTestView } from "./security-view.js";
import { createHealthView } from "./health-view.js";
import { createAuditView } from "./audit-view.js";
import { createTourView } from "./tour-view.js";
import { createSettingsView } from "./settings-view.js";
import { createGlossaryView } from "./glossary-view.js";
import { createScanView } from "./scan-view.js";
import { createLabelsView } from "./labels-view.js";

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
  settingsState,
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
  scenarioProductId,
  productFilterPreset,
  onMoveProduct,
  onMovementSaved,
  dashboardService,
  insightService,
  customFieldService,
  moduleService,
  securityService,
  importService,
  exportService,
  backupService,
  snapshotService,
  mediaService,
  scannerService,
  labelService,
  healthService,
  auditService,
  reversalService,
  privacyDataCenterService,
  pwaService,
  draftService,
  onScanProduct,
  onCriticalOperationChange,
  onResetWorkspace,
  onSaveSettings,
  onBackupRestored,
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
  if (route === "/glossary") return createGlossaryView({ title, description, t });

  if (route.startsWith("/products")) {
    return createProductRouteView({ title, description, route, params, t, locale, currentWorkspace, workspace: currentWorkspace, service: productService, mediaService, movementService, insightService, draftService, onMoveProduct, onSaved: onProductSaved, onArchived: onProductArchived, initialFilters: productFilterPreset });
  }
  if (route === "/movements") return createMovementView({ title, description, t, locale, workspace: currentWorkspace, productService, movementService, draftService, initialProductId: movementProductId, initialType: movementType, onSaved: onMovementSaved, onCriticalOperationChange });
  if (route === "/scan") return createScanView({ title, description, t, workspace: currentWorkspace, scannerService, onSelectProduct: onScanProduct });
  if (route === "/labels") return createLabelsView({ title, description, t, workspace: currentWorkspace, service: labelService });
  if (route === "/dashboard") return createDashboardView({ title, description, t, locale, workspace: currentWorkspace, service: dashboardService });
  if (route === "/radar") return createRadarView({ title, description, t, workspace: currentWorkspace, service: dashboardService });
  if (route === "/insights") return createInsightsView({ title, description, t, locale, workspace: currentWorkspace, service: insightService });
  if (route === "/scenario") return createScenarioView({ title, description, t, locale, workspace: currentWorkspace, productService, movementService, initialProductId: scenarioProductId });
  if (route === "/time-machine") return createTimeMachineView({ title, description, t, locale, workspace: currentWorkspace, productService, movementService });
  if (route === "/digital-twin") return createDigitalTwinView({ title, description, t, locale, workspace: currentWorkspace, productService, movementService });
  if (route === "/kits") return createModuleView({ title, description, t, workspace: currentWorkspace, service: moduleService });
  if (route === "/shield-test") return createShieldTestView({ title, description, t, service: securityService });
  if (route === "/health") return createHealthView({ title, description, t, workspace: currentWorkspace, service: healthService });
  if (route === "/audit") return createAuditView({ title, description, t, workspace: currentWorkspace, service: auditService, reversalService, onReversed: onMovementSaved });
  if (route.startsWith("/settings")) return createSettingsView({ route, t, locale, workspace: currentWorkspace, persistenceReady, appState: settingsState, onReset: onResetWorkspace, onSave: onSaveSettings, customFieldService, securityService, importService, exportService, backupService, snapshotService, privacyDataCenterService, pwaService, onApplyUpdate: () => pwaService.applyUpdate(), onBackupRestored });

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
