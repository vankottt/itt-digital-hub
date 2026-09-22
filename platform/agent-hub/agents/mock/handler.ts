import type { Agent } from "../../src/agent";
import { readManifest } from "../../src/manifest";

const manifest = readManifest(new URL("./manifest.json", import.meta.url));

export const mockAgent: Agent = {
  manifest,
  async handle(request, context) {
    const result = await context.models.complete({
      provider: "mock",
      model: manifest.modelPolicy?.model ?? "mock-1",
      messages: [
        { role: "system", content: "You are the ITT mock agent." },
        ...request.history,
        { role: "user", content: request.message },
      ],
      signal: context.signal,
    });
    return { answer: result.text };
  },
};
