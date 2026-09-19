import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const PORT = Number.parseInt(process.env.NEXSTOCK_PORT ?? "4173", 10);
const ROOT = process.cwd();
const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".webmanifest", "application/manifest+json"],
]);

createServer((request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  const relativePath = pathname.replace(/^\/nexstock\/?/, "") || "index.html";
  const safePath = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
  if (!existsSync(filePath)) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": MIME_TYPES.get(extname(filePath)) ?? "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}).listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`NexStock disponível em http://127.0.0.1:${PORT}/nexstock/#/welcome\n`);
});
