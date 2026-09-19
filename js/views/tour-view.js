import { createBrandImage } from "../components/brand.js";
import { createButton } from "../components/button.js";

function text(tag, value, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

export const TOUR_STEPS = Object.freeze([
  Object.freeze({ id: "pulse" }),
  Object.freeze({ id: "products" }),
  Object.freeze({ id: "insight" }),
  Object.freeze({ id: "scenario" }),
  Object.freeze({ id: "profiles" }),
  Object.freeze({ id: "shield" }),
]);

export function createTourView({ title, description, t }) {
  const section = document.createElement("section");
  section.className = "tour-view route-stack";
  section.setAttribute("aria-labelledby", "route-title");

  const hero = document.createElement("header");
  hero.className = "tour-hero";
  const copy = document.createElement("div");
  const heading = text("h1", title);
  heading.id = "route-title";
  heading.tabIndex = -1;
  copy.append(heading, text("p", description), text("p", t("tour.promise"), "brand-slogan"));
  hero.append(copy, createBrandImage("mascot", { decorative: true, loading: "eager" }));

  const overview = document.createElement("section");
  overview.className = "ns-alert ns-alert--info";
  overview.setAttribute("aria-labelledby", "tour-overview-title");
  const overviewTitle = text("h2", t("tour.overviewTitle"), "ns-alert__title");
  overviewTitle.id = "tour-overview-title";
  overview.append(overviewTitle, text("p", t("tour.overviewMessage")));

  const stepsTitle = text("h2", t("tour.stepsTitle"));
  const list = document.createElement("ol");
  list.className = "tour-steps";
  for (const [index, step] of TOUR_STEPS.entries()) {
    const item = document.createElement("li");
    item.className = "tour-step";
    item.append(
      text("p", t("tour.stepLabel", { current: index + 1, total: TOUR_STEPS.length }), "route-meta"),
      text("h3", t(`tour.steps.${step.id}.title`)),
      text("p", t(`tour.steps.${step.id}.description`)),
      text("p", t(`tour.steps.${step.id}.example`), "tour-step__example"),
    );
    list.append(item);
  }

  const actions = document.createElement("div");
  actions.className = "welcome-actions";
  actions.append(
    createButton({ text: t("tour.start"), href: "#/onboarding" }),
    createButton({ text: t("tour.back"), href: "#/welcome", variant: "secondary" }),
  );
  section.append(hero, overview, stepsTitle, list, actions);
  return { element: section, focusTarget: heading };
}
