import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(projectRoot, "..");
const targetRoot = path.join(projectRoot, "public", "labs");
const labs = [
  ["gcn", "gcn-visual-lab"],
  ["graphsage", "graphsage-visual-lab"],
  ["gat", "gat-visual-lab"],
];

await fs.rm(targetRoot, { recursive: true, force: true });
await fs.mkdir(targetRoot, { recursive: true });

for (const [targetName, sourceName] of labs) {
  const source = path.join(workspaceRoot, sourceName, "dist", "embedded.html");
  const target = path.join(targetRoot, targetName);
  await fs.mkdir(target, { recursive: true });
  await fs.copyFile(source, path.join(target, "embedded.html"));
}

console.log(`Synced ${labs.length} self-contained Visual Labs into ${targetRoot}`);
