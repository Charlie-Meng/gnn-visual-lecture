import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)));
    } else {
      files.push(absolutePath);
    }
  }

  return files;
}

const ignoredFiles = new Set(["sw.js", "_headers", "_redirects"]);
const files = (await walk(distRoot))
  .map((absolutePath) => ({
    absolutePath,
    relativePath: path.relative(distRoot, absolutePath).split(path.sep).join("/"),
  }))
  .filter(({ relativePath }) => !ignoredFiles.has(relativePath))
  .sort((a, b) => a.relativePath.localeCompare(b.relativePath));

const fingerprint = createHash("sha256");
let totalBytes = 0;

for (const file of files) {
  const fileStat = await stat(file.absolutePath);
  totalBytes += fileStat.size;
  fingerprint.update(file.relativePath);
  fingerprint.update(await readFile(file.absolutePath));
}

const version = fingerprint.digest("hex").slice(0, 12);
const precacheUrls = ["./", ...files.map(({ relativePath }) => `./${relativePath}`)];
const serviceWorker = `const CACHE_NAME = "gnn-visual-lecture-${version}";
const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.waitUntil(cleanupOldCaches());

  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match("./index.html"))),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});

let cleanupPromise;
function cleanupOldCaches() {
  if (!cleanupPromise) {
    cleanupPromise = caches.keys().then((names) => Promise.all(
      names
        .filter((name) => name.startsWith("gnn-visual-lecture-") && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    ));
  }
  return cleanupPromise;
}
`;

await writeFile(path.join(distRoot, "sw.js"), serviceWorker, "utf8");
console.log(`Generated offline cache ${version}: ${files.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB.`);
