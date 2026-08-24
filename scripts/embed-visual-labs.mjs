import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const labs = ["gcn-visual-lab", "graphsage-visual-lab", "gat-visual-lab"];

const mimeTypes = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

async function inlineCssAssets(css, cssPath) {
  const references = [...css.matchAll(/url\((['"]?)([^'"\)]+)\1\)/g)];
  let inlined = css;

  for (const match of references) {
    const [expression, , reference] = match;
    if (/^(data:|https?:|#)/.test(reference)) continue;

    const assetPath = path.resolve(path.dirname(cssPath), reference);
    const mimeType = mimeTypes[path.extname(assetPath).toLowerCase()] || "application/octet-stream";
    const data = await readFile(assetPath);
    const dataUrl = `url("data:${mimeType};base64,${data.toString("base64")}")`;
    inlined = inlined.split(expression).join(dataUrl);
  }

  return inlined;
}

for (const lab of labs) {
  const dist = path.join(root, lab, "dist");
  let html = await readFile(path.join(dist, "index.html"), "utf8");

  const stylesheetPattern = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/g;
  for (const match of [...html.matchAll(stylesheetPattern)]) {
    const stylesheetPath = path.resolve(dist, match[1]);
    const css = await inlineCssAssets(await readFile(stylesheetPath, "utf8"), stylesheetPath);
    html = html.replace(match[0], () => `<style>${css}</style>`);
  }

  const modulePattern = /<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["'][^>]*><\/script>/g;
  for (const match of [...html.matchAll(modulePattern)]) {
    const scriptPath = path.resolve(dist, match[1]);
    const script = (await readFile(scriptPath, "utf8")).replaceAll("</script", "<\\/script");
    html = html.replace(match[0], () => `<script type="module">${script}</script>`);
  }

  await writeFile(path.join(dist, "embedded.html"), html, "utf8");
  console.log(`Created self-contained Visual Lab: ${lab}/dist/embedded.html`);
}
