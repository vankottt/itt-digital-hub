import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../content/ai-act-kit");

export interface KitFile {
  path: string;
  content: string;
}

function isInsideRoot(full: string): boolean {
  const relative = path.relative(KIT_ROOT, full);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

export function kitRoot(): string {
  return KIT_ROOT;
}

export function readKitFile(relativePath: string): string {
  const full = path.resolve(KIT_ROOT, relativePath);
  if (!isInsideRoot(full)) throw new Error("Invalid kit path");
  return readFileSync(full, "utf8");
}

export function loadKitTree(): KitFile[] {
  const files: KitFile[] = [];

  function walk(dir: string, rel: string): void {
    for (const name of readdirSync(dir)) {
      if (name.startsWith(".")) continue;
      if (name.endsWith(".ts")) continue;
      const full = path.join(dir, name);
      const nextRel = rel ? `${rel}/${name}` : name;
      if (statSync(full).isDirectory()) {
        walk(full, nextRel);
        continue;
      }
      if (!name.endsWith(".md")) continue;
      files.push({ path: nextRel, content: readFileSync(full, "utf8") });
    }
  }

  walk(KIT_ROOT, "");
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function loadSourceFiles(): KitFile[] {
  return loadKitTree().filter((file) => file.path.startsWith("sources/"));
}
