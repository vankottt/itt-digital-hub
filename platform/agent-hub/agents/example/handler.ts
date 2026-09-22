import type { Agent } from "../../src/agent";
import { readManifest } from "../../src/manifest";

const manifest = readManifest(new URL("./manifest.json", import.meta.url));

export const exampleAgent: Agent = {
  manifest,
  async handle() {
    throw new Error("Disabled agent must not run");
  },
};
