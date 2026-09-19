import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

const ROOT = process.cwd();
const PNG_SIGNATURE = "89504e470d0a1a0a";

const EXPECTED_PNGS = Object.freeze({
  "assets/brand/logos/nexstock-main-logo-16x9.png": [1920, 1080, true],
  "assets/brand/logos/nexstock-stacked-logo-4x3.png": [1600, 1200, true],
  "assets/brand/mascot/nexstock-mascot-full-body-3x4.png": [1200, 1600, true],
  "assets/brand/symbols/nexstock-app-icon-1x1.png": [1024, 1024, true],
  "assets/brand/symbols/nexstock-brand-symbol-1x1.png": [1024, 1024, true],
  "assets/icons/pwa/favicon-32x32.png": [32, 32, false],
  "assets/icons/pwa/favicon-48x48.png": [48, 48, false],
  "assets/icons/pwa/icon-192x192.png": [192, 192, false],
  "assets/icons/pwa/icon-512x512.png": [512, 512, false],
  "assets/icons/pwa/icon-maskable-512x512.png": [512, 512, false],
});

function paethPredictor(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  if (aboveDistance <= upperLeftDistance) return above;
  return upperLeft;
}

function inspectPng(relativePath) {
  const buffer = readFileSync(join(ROOT, relativePath));
  if (buffer.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) {
    throw new Error(`${relativePath} não possui assinatura PNG válida.`);
  }

  let offset = 8;
  let header;
  const imageData = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    }
    if (type === "IDAT") imageData.push(data);
    if (type === "IEND") break;
    offset += length + 12;
  }

  if (!header) throw new Error(`${relativePath} não contém IHDR.`);
  if (header.bitDepth !== 8 || header.interlace !== 0) {
    throw new Error(`${relativePath} usa formato PNG não previsto pela validação.`);
  }

  let hasTransparentPixel = false;
  let firstPixel;
  if (header.colorType === 2 || header.colorType === 6) {
    const bytesPerPixel = header.colorType === 6 ? 4 : 3;
    const rowLength = header.width * bytesPerPixel;
    const raw = inflateSync(Buffer.concat(imageData));
    let previous = Buffer.alloc(rowLength);
    let rawOffset = 0;

    for (let row = 0; row < header.height; row += 1) {
      const filter = raw[rawOffset];
      rawOffset += 1;
      const scanline = raw.subarray(rawOffset, rawOffset + rowLength);
      rawOffset += rowLength;
      const reconstructed = Buffer.alloc(rowLength);

      for (let column = 0; column < rowLength; column += 1) {
        const left = column >= bytesPerPixel ? reconstructed[column - bytesPerPixel] : 0;
        const above = previous[column];
        const upperLeft = column >= bytesPerPixel ? previous[column - bytesPerPixel] : 0;
        const filterValue = [
          0,
          left,
          above,
          Math.floor((left + above) / 2),
          paethPredictor(left, above, upperLeft),
        ][filter];
        if (filterValue === undefined) throw new Error(`${relativePath} usa filtro PNG inválido.`);
        reconstructed[column] = (scanline[column] + filterValue) & 0xff;
      }

      for (let alphaIndex = 3; alphaIndex < rowLength; alphaIndex += bytesPerPixel) {
        if (header.colorType === 6 && reconstructed[alphaIndex] < 255) {
          hasTransparentPixel = true;
          break;
        }
      }
      if (row === 0) firstPixel = reconstructed.subarray(0, 3).toString("hex");
      previous = reconstructed;
    }
  }

  return { ...header, firstPixel, hasTransparentPixel };
}

function inspectJpeg(relativePath) {
  const buffer = readFileSync(join(ROOT, relativePath));
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error(`${relativePath} não é JPEG válido.`);
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  throw new Error(`${relativePath} não contém dimensões JPEG reconhecíveis.`);
}

for (const [relativePath, [expectedWidth, expectedHeight, requiresAlpha]] of Object.entries(EXPECTED_PNGS)) {
  const image = inspectPng(relativePath);
  if (image.width !== expectedWidth || image.height !== expectedHeight) {
    throw new Error(`${relativePath} possui ${image.width}x${image.height}; esperado ${expectedWidth}x${expectedHeight}.`);
  }
  if (requiresAlpha && (image.colorType !== 6 || !image.hasTransparentPixel)) {
    throw new Error(`${relativePath} não contém transparência real verificável.`);
  }
  if (relativePath.startsWith("assets/icons/pwa/") && image.firstPixel !== "0b1120") {
    throw new Error(`${relativePath} não preserva o fundo oficial #0B1120.`);
  }
}

const hero = inspectJpeg("assets/brand/scenes/nexstock-brand-scene-16x9.jpg");
if (hero.width !== 1920 || hero.height !== 1080) {
  throw new Error(`Hero possui ${hero.width}x${hero.height}; esperado 1920x1080.`);
}

const manifest = JSON.parse(readFileSync(join(ROOT, "docs/brand-assets.json"), "utf8"));
if (manifest.version !== "1.2" || manifest.assets.length !== 6 || manifest.pwa.length !== 5) {
  throw new Error("Manifesto de marca não corresponde ao pacote v1.2 esperado.");
}

process.stdout.write("Identidade visual: assets, dimensões e transparência aprovados.\n");
