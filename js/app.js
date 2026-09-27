import { APP_CONFIG } from "./core/config.js";
import { eventBus } from "./core/events.js";
import { Router, normalizeRoute, shouldMoveInitialFocus } from "./core/router.js";
import { store } from "./core/store.js";
import { createToastManager } from "./components/feedback.js";
import { createCommandPalette } from "./components/command-palette.js";
import { createPwaStatus } from "./components/pwa-status.js";
import { bindMobileNavigation } from "./components/mobile-navigation.js";
import { bindMobileOperations } from "./components/mobile-operations.js";
import { bindSkipLink } from "./components/skip-link.js";
import { bindThemeToggle } from "./components/theme-toggle.js";
import { createLocaleLoader, I18n } from "./i18n/i18n.js";
import { createSeedLoader } from "./services/seed-loader.js";
import { ProfileService } from "./services/profile-service.js";
import { ProductService } from "./services/product-service.js";
import { MovementService } from "./services/movement-service.js";
import { DashboardService } from "./services/dashboard-service.js";
import { InsightService } from "./services/insight-service.js";
import { CustomFieldService } from "./services/custom-field-service.js";
import { ModuleService } from "./services/module-service.js";
import { GlobalSearchService, parseNexQuery } from "./services/global-search-service.js";
import { SecurityService } from "./services/security-service.js";
import { DraftService } from "./services/draft-service.js";
import { PwaService } from "./services/pwa-service.js";
import { SettingsService } from "./services/settings-service.js";
import { ImportService } from "./services/import-service.js";
import { ExportService } from "./services/export-service.js";
import { BackupService } from "./services/backup-service.js";
import { SnapshotService } from "./services/snapshot-service.js";
import { MediaService } from "./services/media-service.js";
import { NexScanService, SCAN_ACTIONS } from "./services/scanner-service.js";
import { LabelService } from "./services/label-service.js";
import { HealthService } from "./services/health-service.js";
import { AuditService } from "./services/audit-service.js";
import { ReversalService } from "./services/reversal-service.js";
import { PrivacyDataCenterService } from "./services/privacy-data-center-service.js";
import { APP_VERSION } from "./core/version.js";
import { WorkspaceService } from "./services/workspace-service.js";
import { createDataProvider, readProviderConfig } from "./storage/provider-factory.js";
import { createMediaProvider } from "./storage/media-provider.js";
import { createRouteView } from "./views/route-view.js";

const main = document.querySelector("#main-content");
const skipLink = document.querySelector("#skip-link");
const themeToggle = document.querySelector("#theme-toggle");
const localeSelect = document.querySelector("#locale-select");
const toastLayer = document.querySelector("#toast-layer");
const dialogLayer = document.querySelector("#dialog-layer");
const commandPaletteTrigger = document.querySelector("#command-palette-trigger");
const pwaStatusLayer = document.querySelector("#pwa-status-layer");
const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
const mobileBottomNav = document.querySelector("#mobile-bottom-nav");
const mobileActions = document.querySelector("#mobile-actions");
const mobileSearch = document.querySelector("#mobile-search");
const primaryNavigation = document.querySelector("#primary-nav");
const i18n = new I18n({
  defaultLocale: APP_CONFIG.defaultLocale,
  supportedLocales: APP_CONFIG.supportedLocales,
  loader: createLocaleLoader("./locales"),
});
let themeController;
let dataProvider;
let workspaceService;
let profileService;
let productService;
let movementService;
let dashboardService;
let insightService;
let customFieldService;
let moduleService;
let globalSearchService;
let commandPalette;
let securityService;
let draftService;
let pwaService;
let settingsService;
let importService;
let exportService;
let backupService;
let snapshotService;
let mediaService;
let scannerService;
let labelService;
let healthService;
let auditService;
let reversalService;
let privacyDataCenterService;
let pwaStatus;
let mobileNavigation;
let mobileOperations;
let movementProductId;
let movementType;
let scenarioProductId;
let productFilterPreset;
let toastManager;
let onboardingState;

function updateCurrentNavigation(route) {
  for (const link of document.querySelectorAll(".primary-nav a")) {
    const isCurrent = link.getAttribute("href") === `#${route}`;
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

function localizeRoute(definition) {
  const prefix = `routes.${definition.messageKey}`;
  return {
    ...definition,
    title: i18n.t(`${prefix}.title`),
    description: i18n.t(`${prefix}.description`),
  };
}

function renderRoute(definition, { moveFocus = true } = {}) {
  if (definition.route !== "/scan") scannerService?.stop();
  if (!definition.route.startsWith("/products")) productFilterPreset = undefined;
  if (definition.route !== "/movements" && store.getState().pwa.criticalOperation) {
    store.setState({ pwa: { ...store.getState().pwa, criticalOperation: false } });
  }
  const localizedDefinition = definition.messageKey ? localizeRoute(definition) : definition;
  const view = createRouteView({
    ...localizedDefinition,
    t: (key, parameters) => i18n.t(key, parameters),
    locale: i18n.locale,
    currentWorkspace: store.getState().workspace,
    settingsState: store.getState(),
    persistenceReady: store.getState().persistence === "ready",
    onboardingState,
    onOnboardingStateChange: (state) => { onboardingState = state; },
    onCreateWorkspace: async (setup) => {
      if (!profileService || store.getState().persistence !== "ready") {
        throw new Error("Persistence is unavailable.");
      }
      const workspace = await profileService.createWorkspace(setup);
      onboardingState = undefined;
      store.setState({ workspace });
      eventBus.emit("profile:changed", { profileKey: workspace.profileKey });
      eventBus.emit("workspace:created", { workspaceId: workspace.id });
      toastManager.show({ message: i18n.t("onboarding.created"), tone: "success" });
      window.location.hash = "#/dashboard";
    },
    productService,
    movementService,
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
    movementProductId,
    movementType,
    scenarioProductId,
    productFilterPreset,
    onMoveProduct: (productId) => {
      movementProductId = productId;
      window.location.hash = "#/movements";
    },
    onScanProduct: (productId, action) => {
      if (action === SCAN_ACTIONS.OPEN) { window.location.hash = `#/products/${encodeURIComponent(productId)}`; return; }
      movementProductId = productId;
      movementType = action === SCAN_ACTIONS.ENTRY ? "IN" : "OUT";
      window.location.hash = "#/movements";
    },
    onMovementSaved: () => {
      store.setState({ pwa: { ...store.getState().pwa, criticalOperation: false } });
      movementProductId = undefined;
      movementType = undefined;
      toastManager.show({ message: i18n.t("movement.saved"), tone: "success" });
      router.refresh({ moveFocus: false });
    },
    onCriticalOperationChange: (criticalOperation) => {
      store.setState({ pwa: { ...store.getState().pwa, criticalOperation } });
    },
    onResetWorkspace: async () => {
      store.setState({ pwa: { ...store.getState().pwa, criticalOperation: true } });
      try {
        const workspace = await workspaceService.resetActiveWorkspace();
        if (!workspace) throw new Error("No active workspace.");
        store.setState({ workspace, pwa: { ...store.getState().pwa, criticalOperation: false } });
        eventBus.emit("workspace:reset", { workspaceId: workspace.id });
        toastManager.show({ message: i18n.t("settingsCore.resetSuccess"), tone: "success" });
        window.location.hash = "#/dashboard";
      } catch (error) {
        store.setState({ pwa: { ...store.getState().pwa, criticalOperation: false } });
        throw error;
      }
    },
    onSaveSettings: async (patch) => {
      const current = store.getState().workspace;
      if (!current || !settingsService) throw new Error("Workspace settings are unavailable.");
      const workspace = await settingsService.updateWorkspace(current.id, patch);
      const nextState = { workspace, experienceMode: workspace.experienceMode };
      if (patch.theme) nextState.theme = workspace.theme;
      store.setState(nextState);
      eventBus.emit("settings:saved", { workspaceId: workspace.id, keys: Object.keys(patch) });
      return workspace;
    },
    onBackupRestored: async (workspace) => {
      store.setState({ workspace, theme: workspace.theme ?? "light", experienceMode: workspace.experienceMode ?? "guided" });
      eventBus.emit("workspace:restored", { workspaceId: workspace.id });
      toastManager.show({ message: i18n.t("backupCenter.successToast"), tone: "success" });
      window.location.hash = "#/dashboard";
    },
    onProductSaved: (product) => {
      toastManager.show({ message: i18n.t("productCore.saved"), tone: "success" });
      window.location.hash = `#/products/${encodeURIComponent(product.id)}`;
    },
    onProductArchived: () => {
      toastManager.show({ message: i18n.t("productCore.archived"), tone: "success" });
      window.location.hash = "#/products";
    },
  });
  view.element.classList.add("ns-route-enter");
  main.replaceChildren(view.element);
  document.title = `${localizedDefinition.title} | ${APP_CONFIG.name}`;
  updateCurrentNavigation(localizedDefinition.route);
  if (moveFocus) view.focusTarget.focus();
  eventBus.emit("route:changed", localizedDefinition);
}

const router = new Router({
  onRouteChange: renderRoute,
  onNotFound: ({ route }, context) => {
    renderRoute({
      title: i18n.t("errors.notFoundTitle"),
      description: i18n.t("errors.notFoundDescription"),
      route,
      isNotFound: true,
    }, context);
  },
});

function applyShellTranslations() {
  document.documentElement.lang = i18n.locale;
  document.querySelector("#skip-link").textContent = i18n.t("app.skipLink");
  document.querySelector("#sidebar-brand").setAttribute("aria-label", i18n.t("app.homeLabel"));
  document.querySelector("#primary-nav").setAttribute("aria-label", i18n.t("app.navLabel"));
  document.querySelector("#app-eyebrow").textContent = i18n.t("app.eyebrow");
  document.querySelector("#phase-label").textContent = i18n.t("app.phase");
  document.querySelector("#locale-label").textContent = i18n.t("app.languageLabel");
  toastLayer.setAttribute("aria-label", i18n.t("app.toastLabel"));
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = i18n.t(element.dataset.i18n);
  }
  localeSelect.value = i18n.locale;
  themeController?.render();
  mobileNavigation?.render();
}

async function initializePersistence(toastManager) {
  const providerConfig = readProviderConfig();
  dataProvider = createDataProvider({ config: providerConfig, indexedDBOptions: {
    onBlocked: () => toastManager.show({ message: i18n.t("storage.blocked"), tone: "warning" }),
    onVersionChange: () => {
      store.setState({ persistence: "unavailable" });
      toastManager.show({ message: i18n.t("storage.versionChanged"), tone: "warning" });
    },
  } });
  workspaceService = new WorkspaceService({
    provider: dataProvider,
    seedLoader: createSeedLoader("./demo"),
  });
  profileService = new ProfileService({
    workspaceService,
    translate: (key) => i18n.t(key),
  });
  productService = new ProductService({ provider: dataProvider });
  scannerService = new NexScanService({ productService });
  labelService = new LabelService({ provider: dataProvider });
  healthService = new HealthService({ provider: dataProvider });
  auditService = new AuditService({ provider: dataProvider });
  reversalService = new ReversalService({ provider: dataProvider });
  privacyDataCenterService = new PrivacyDataCenterService({ providerType: providerConfig.type });
  mediaService = new MediaService({ mediaProvider: createMediaProvider({ provider: dataProvider, type: providerConfig.type }) });
  movementService = new MovementService({ provider: dataProvider });
  dashboardService = new DashboardService({ provider: dataProvider });
  insightService = new InsightService({ provider: dataProvider });
  customFieldService = new CustomFieldService({ provider: dataProvider });
  moduleService = new ModuleService({ provider: dataProvider });
  globalSearchService = new GlobalSearchService({ productService });
  securityService = new SecurityService({ appVersion: APP_VERSION, provider: dataProvider.constructor.name, database: providerConfig.type === "supabase" ? "PostgreSQL/Supabase" : "nexstock-db" });
  draftService = new DraftService();
  settingsService = new SettingsService({ provider: dataProvider });
  exportService = new ExportService({ provider: dataProvider });
  backupService = new BackupService({ provider: dataProvider, mediaService });
  snapshotService = new SnapshotService({ provider: dataProvider, backupService });
  importService = new ImportService({ provider: dataProvider, snapshotService });

  try {
    await dataProvider.open();
    const workspace = await workspaceService.restoreActiveWorkspace();
    store.setState({
      workspace,
      persistence: "ready",
      provider: providerConfig.type,
      ...(workspace ? { theme: workspace.theme ?? "light", experienceMode: workspace.experienceMode ?? "guided" } : {}),
    });
    eventBus.emit("storage:ready", { workspaceId: workspace?.id ?? null });
  } catch (error) {
    store.setState({ persistence: "unavailable" });
    eventBus.emit("storage:error", { error });
    toastManager.show({ message: i18n.t("storage.unavailable"), tone: "danger" });
  }
}

function initializeCommandPalette() {
  commandPalette?.destroy();
  commandPalette?.element.remove();
  commandPalette = createCommandPalette({
    layer: dialogLayer, trigger: commandPaletteTrigger,
    translate: (key, parameters) => i18n.t(key, parameters),
    getActions: () => {
      const ready = Boolean(store.getState().workspace);
      return [
        { id: "new-product", label: i18n.t("commandPalette.actions.newProduct"), keywords: "new product novo produto", href: "#/products/new", disabled: !ready },
        { id: "search", label: i18n.t("commandPalette.actions.search"), keywords: "find buscar pesquisar", href: "#/products", disabled: !ready },
        { id: "entry", label: i18n.t("commandPalette.actions.entry"), keywords: "in entrada", href: "#/movements", movementType: "IN", disabled: !ready },
        { id: "output", label: i18n.t("commandPalette.actions.output"), keywords: "out saída", href: "#/movements", movementType: "OUT", disabled: !ready },
        { id: "scan", label: i18n.t("commandPalette.actions.scan"), keywords: "scan scanner camera codigo código", href: "#/scan", disabled: !ready },
        { id: "critical", label: i18n.t("commandPalette.actions.critical"), keywords: "critical críticos", href: "#/products", productStatus: "critical", disabled: !ready },
        { id: "scenario", label: i18n.t("commandPalette.actions.scenario"), href: "#/scenario", disabled: !ready },
        { id: "time-machine", label: i18n.t("commandPalette.actions.timeMachine"), href: "#/time-machine", disabled: !ready },
        { id: "digital-twin", label: i18n.t("commandPalette.actions.digitalTwin"), href: "#/digital-twin", disabled: !ready },
        { id: "language", label: i18n.t("commandPalette.actions.language"), action: "language" },
        { id: "theme", label: i18n.t("commandPalette.actions.theme"), action: "theme" },
      ];
    },
    searchProducts: async (query) => {
      const nexQuery = parseNexQuery(query);
      const products = await globalSearchService.searchProducts(store.getState().workspace?.id, query);
      const productActions = products.map((product) => {
        const action = product.operation ?? "open";
        return {
          ...product,
          label: i18n.t(`commandPalette.productActions.${action}`, { product: product.label }),
          description: product.description,
          ...(action === "entry" ? { movementType: "IN", href: "#/movements" } : {}),
          ...(action === "output" ? { movementType: "OUT", href: "#/movements" } : {}),
          ...(action === "scenario" ? { scenarioProductId: product.productId, href: "#/scenario" } : {}),
        };
      });
      if (!nexQuery || !store.getState().workspace) return productActions;
      return [{
        id: `nex-query-${nexQuery.id}`, type: "query", href: "#/products", productFilters: nexQuery.filters,
        label: i18n.t(`commandPalette.queryActions.${nexQuery.id}`),
        description: i18n.t("commandPalette.queryDescription"),
      }, ...productActions];
    },
    onSelect: (item) => {
      if (item.movementType) movementType = item.movementType;
      if (item.movementType && item.productId) movementProductId = item.productId;
      if (item.scenarioProductId) scenarioProductId = item.scenarioProductId;
      if (item.productStatus) productFilterPreset = { status: item.productStatus };
      if (item.productFilters) productFilterPreset = item.productFilters;
      if (item.action === "language") { localeSelect.focus(); return; }
      if (item.action === "theme") { themeToggle.click(); return; }
      if (item.href) window.location.hash = item.href;
    },
  });
}

function initializeMobileOperations() {
  mobileOperations?.destroy();
  mobileOperations = bindMobileOperations({ navigation: mobileBottomNav, actionsButton: mobileActions, dialogLayer, translate: (key) => i18n.t(key), onSearch: () => commandPalette.open(), onMove: (type) => { movementType = type; window.location.hash = "#/movements"; }, onScan: () => { window.location.hash = "#/scan"; } });
  mobileSearch.onclick = () => commandPalette.open();
}

async function bootstrap() {
  main.setAttribute("aria-busy", "true");
  await i18n.init(store.getState().locale);
  toastManager = createToastManager(toastLayer, {
    getCloseLabel: () => i18n.t("app.closeNotification"),
  });
  pwaStatus = createPwaStatus({
    container: pwaStatusLayer,
    translate: (key) => i18n.t(key),
    onUpdate: () => {
      if (store.getState().pwa.criticalOperation) {
        toastManager.show({ message: i18n.t("pwa.updateDeferred"), tone: "warning" });
        return;
      }
      pwaService.applyUpdate();
    },
  });
  pwaService = new PwaService({
    onConnectionChange: (connection) => {
      store.setState({ connection });
      pwaStatus.renderConnection(connection);
      eventBus.emit(`connection:${connection}`);
      if (normalizeRoute(window.location.hash) === "/settings/pwa") router.refresh({ moveFocus: false });
    },
    onUpdateAvailable: () => {
      store.setState({ pwa: { ...store.getState().pwa, updateAvailable: true } });
      pwaStatus.showUpdate();
      eventBus.emit("app:updateAvailable");
    },
    onInstallAvailable: () => {
      store.setState({ pwa: { ...store.getState().pwa, installAvailable: true } });
      if (normalizeRoute(window.location.hash) === "/settings/pwa") router.refresh({ moveFocus: false });
    },
  });

  themeController = bindThemeToggle({
    button: themeToggle,
    store,
    translate: (key) => i18n.t(key),
  });
  mobileNavigation = bindMobileNavigation({
    button: mobileNavToggle,
    navigation: primaryNavigation,
    translate: (key) => i18n.t(key),
  });
  bindSkipLink({ link: skipLink, target: main });
  store.subscribe((state) => {
    document.documentElement.dataset.theme = state.theme;
  });
  applyShellTranslations();
  await initializePersistence(toastManager);

  initializeCommandPalette();
  initializeMobileOperations();

  localeSelect.addEventListener("change", async (event) => {
    const previousLocale = i18n.locale;
    localeSelect.disabled = true;
    try {
      await i18n.setLocale(event.target.value);
      store.setState({ locale: i18n.locale });
      toastManager.clear();
      applyShellTranslations();
      pwaStatus.renderConnection(store.getState().connection);
      if (store.getState().pwa.updateAvailable) pwaStatus.showUpdate();
      initializeCommandPalette();
      initializeMobileOperations();
      router.refresh({ moveFocus: false });
      eventBus.emit("locale:changed", { locale: i18n.locale });
    } catch {
      localeSelect.value = previousLocale;
      toastManager.show({ message: i18n.t("app.localeError"), tone: "danger" });
    } finally {
      localeSelect.disabled = false;
      localeSelect.focus();
    }
  });

  main.removeAttribute("aria-busy");
  router.start({ moveFocus: shouldMoveInitialFocus(document) });
  pwaService.start().catch(() => toastManager.show({ message: i18n.t("pwa.registrationError"), tone: "warning" }));
  window.addEventListener("pagehide", () => dataProvider?.close(), { once: true });
}

bootstrap().catch(() => {
  main.removeAttribute("aria-busy");
  main.textContent = i18n.t("errors.startup");
});
