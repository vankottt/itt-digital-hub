import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { privacyPage } from "../src/content/pages";
import { engagements } from "../src/content/engagements";
import { contactEmail } from "../src/content/site";

const MARKER = /TODO_(CONTENT|VERIFY|ASSET|PERMISSION)/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (/\.(ts|tsx|js|jsx|md|json|css)$/.test(entry.name)) out.push(path);
  }
  return out;
}

describe("public copy finish", () => {
  it("does not leave TODO_ markers in site source", () => {
    const root = resolve(__dirname, "../src");
    const hits: string[] = [];
    for (const file of walk(root)) {
      const text = readFileSync(file, "utf8");
      if (MARKER.test(text)) hits.push(relative(root, file));
    }
    expect(hits).toEqual([]);
  });

  it("keeps the privacy notice specific without an unpublished inbox", () => {
    expect(contactEmail).toBe("office@ittdigitalhub.uk");
    expect(privacyPage.body.en.at(-1)).toMatch(/contact form, the published email address and the published phone numbers/i);
    expect(privacyPage.body.bg.at(-1)).toMatch(/контактната форма, публикувания имейл адрес и публикуваните телефонни номера/);
    expect(privacyPage.body.en.join("\n")).not.toMatch(MARKER);
    expect(privacyPage.body.bg.join("\n")).not.toMatch(MARKER);
  });

  it("does not publish the personal Gmail inbox", () => {
    const root = resolve(__dirname, "../src/content");
    const hits: string[] = [];
    for (const file of walk(root)) {
      const text = readFileSync(file, "utf8");
      if (/gmail\.com/i.test(text)) hits.push(relative(root, file));
    }
    expect(hits).toEqual([]);
  });

  it("does not use em dashes in public content strings", () => {
    const root = resolve(__dirname, "../src/content");
    const hits: string[] = [];
    for (const file of walk(root)) {
      const text = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      if (text.includes("—")) hits.push(relative(root, file));
    }
    expect(hits).toEqual([]);
  });

  it("does not publish draft relationship labels in the engagement catalogue", () => {
    for (const item of engagements) {
      expect(item.kindLabel.en).not.toMatch(MARKER);
      expect(item.kindLabel.bg).not.toMatch(MARKER);
    }
  });
});
