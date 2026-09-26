import { defineConfig } from "@playwright/test";
import { chmodSync, createReadStream, createWriteStream, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { createBrotliDecompress } from "node:zlib";

const runtimeDirectory = resolve(".playwright-runtime");
mkdirSync(runtimeDirectory, { recursive: true });
process.env.TMPDIR = runtimeDirectory;

const executablePath = join(runtimeDirectory, "chromium");
if (!existsSync(executablePath) || statSync(executablePath).size === 0) {
  await pipeline(
    createReadStream(resolve("node_modules/@sparticuz/chromium/bin/chromium.br")),
    createBrotliDecompress(),
    createWriteStream(executablePath, { mode: 0o700 }),
  );
}
chmodSync(executablePath, 0o700);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    serviceWorkers: "allow",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    launchOptions: {
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-dev-shm-usage",
      ],
    },
  },
  webServer: {
    command: "node scripts/serve.mjs",
    url: "http://127.0.0.1:4173/nexstock/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
