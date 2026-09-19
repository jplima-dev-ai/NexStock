const BRAND_ASSETS = Object.freeze({
  mainLogo: Object.freeze({
    src: "./assets/brand/logos/nexstock-main-logo-16x9.png",
    width: 1920,
    height: 1080,
    className: "brand-logo brand-logo--main",
    defaultAlt: "NexStock",
  }),
  stackedLogo: Object.freeze({
    src: "./assets/brand/logos/nexstock-stacked-logo-4x3.png",
    width: 1600,
    height: 1200,
    className: "brand-logo brand-logo--stacked",
    defaultAlt: "NexStock",
  }),
  appMark: Object.freeze({
    src: "./assets/brand/symbols/nexstock-app-icon-1x1.png",
    width: 1024,
    height: 1024,
    className: "brand-mark",
    defaultAlt: "NexStock",
  }),
  symbol: Object.freeze({
    src: "./assets/brand/symbols/nexstock-brand-symbol-1x1.png",
    width: 1024,
    height: 1024,
    className: "brand-illustration brand-illustration--symbol",
    defaultAlt: "Esquilo do NexStock organizando itens no estoque",
  }),
  mascot: Object.freeze({
    src: "./assets/brand/mascot/nexstock-mascot-full-body-3x4.png",
    width: 1200,
    height: 1600,
    className: "brand-illustration brand-illustration--mascot",
    defaultAlt: "Mascote esquilo do NexStock organizando o estoque",
  }),
  hero: Object.freeze({
    src: "./assets/brand/scenes/nexstock-brand-scene-16x9.jpg",
    width: 1920,
    height: 1080,
    className: "brand-illustration brand-illustration--hero",
    defaultAlt: "Ilustração do NexStock com um esquilo organizando itens em uma rede digital",
  }),
});

export function getBrandAsset(kind) {
  const asset = BRAND_ASSETS[kind];
  if (!asset) throw new RangeError(`Asset de marca desconhecido: ${kind}`);
  return asset;
}

export function createBrandImage(kind, { decorative = false, loading = "eager", fetchPriority } = {}) {
  const asset = getBrandAsset(kind);
  const image = document.createElement("img");
  image.src = asset.src;
  image.width = asset.width;
  image.height = asset.height;
  image.className = asset.className;
  image.alt = decorative ? "" : asset.defaultAlt;
  image.loading = loading;
  image.decoding = "async";
  if (fetchPriority) image.fetchPriority = fetchPriority;
  return image;
}

export function createBrandLockup({ variant = "stacked", slogan }) {
  const wrapper = document.createElement("div");
  wrapper.className = "brand-lockup";

  const logoKind = variant === "main" ? "mainLogo" : "stackedLogo";
  wrapper.append(createBrandImage(logoKind, { decorative: false }));

  if (slogan) {
    const sloganElement = document.createElement("p");
    sloganElement.className = "brand-slogan";
    sloganElement.textContent = slogan;
    wrapper.append(sloganElement);
  }
  return wrapper;
}
