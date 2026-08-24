import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.resolve(projectRoot, "../output/gnn/rendered");
const targetDir = path.resolve(projectRoot, "public/slides");

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });

const slideFiles = (await readdir(sourceDir))
  .filter((file) => /^slide-\d{2}\.png$/.test(file))
  .sort();

if (slideFiles.length !== 62) {
  throw new Error(`Expected 62 integrated slide renders, found ${slideFiles.length}.`);
}

await Promise.all(slideFiles.map((file) => copyFile(path.join(sourceDir, file), path.join(targetDir, file))));
console.log(`Synced ${slideFiles.length} integrated slide renders into ${targetDir}`);
