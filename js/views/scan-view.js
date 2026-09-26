import { createAlert } from "../components/feedback.js";
import { createButton } from "../components/button.js";
import { createField } from "../components/field.js";
import { SCAN_ACTIONS, ScannerUnavailableError } from "../services/scanner-service.js";

function text(tag, value, className) { const element = document.createElement(tag); if (className) element.className = className; element.textContent = value; return element; }

export function createScanView({ title, description, t, workspace, scannerService, onSelectProduct }) {
  const section = document.createElement("section"); section.className = "route-stack";
  const heading = text("h1", title); heading.id = "route-title"; heading.tabIndex = -1; section.append(heading, text("p", description));
  if (!workspace) { section.append(createAlert({ title: t("scan.workspaceRequiredTitle"), message: t("scan.workspaceRequiredMessage"), tone: "warning" })); return { element: section, focusTarget: heading }; }
  const status = text("p", scannerService.cameraSupported ? t("scan.cameraAvailable") : t("scan.cameraUnavailable"), "route-meta"); status.setAttribute("role", "status");
  const video = document.createElement("video"); video.className = "scan-video"; video.playsInline = true; video.muted = true; video.hidden = true; video.tabIndex = -1; video.setAttribute("aria-hidden", "true");
  const code = createField({ id: "scan-code", label: t("scan.codeLabel"), helpText: t("scan.codeHelp"), autocomplete: "off" });
  const action = createField({ id: "scan-action", label: t("scan.actionLabel"), type: "select", options: [{ value: SCAN_ACTIONS.OPEN, label: t("scan.actions.open") }, { value: SCAN_ACTIONS.ENTRY, label: t("scan.actions.entry") }, { value: SCAN_ACTIONS.OUTPUT, label: t("scan.actions.output") }] });
  const feedback = document.createElement("div"); feedback.setAttribute("aria-live", "polite");
  const form = document.createElement("form"); form.className = "movement-form";
  async function resolve() { feedback.replaceChildren(); const product = await scannerService.findProduct(workspace.id, code.control.value); if (!product) { feedback.append(createAlert({ message: t("scan.notFound"), tone: "warning" })); return; } onSelectProduct(product.id, action.control.value); }
  form.addEventListener("submit", (event) => { event.preventDefault(); resolve().catch(() => feedback.replaceChildren(createAlert({ message: t("scan.notFound"), tone: "danger" }))); });
  const camera = createButton({ text: t("scan.startCamera"), variant: "secondary", onClick: async () => { try { await scannerService.start(video, (value) => { code.control.value = value; status.textContent = t("scan.codeDetected"); resolve().catch(() => {}); }); video.hidden = false; status.textContent = scannerService.barcodeSupported ? t("scan.cameraScanning") : t("scan.cameraManualOnly"); } catch (error) { status.textContent = error instanceof ScannerUnavailableError ? t("scan.cameraUnavailable") : t("scan.cameraError"); } } });
  const stop = createButton({ text: t("scan.stopCamera"), variant: "quiet", onClick: () => { scannerService.stop(); video.hidden = true; status.textContent = t("scan.cameraStopped"); } });
  form.append(status, video, code.element, action.element, feedback, createButton({ text: t("scan.useCode"), type: "submit" }), camera, stop);
  section.append(createAlert({ title: t("scan.manualTitle"), message: t("scan.manualMessage"), tone: "info" }), form);
  return { element: section, focusTarget: heading };
}
