import type { ModelProvider, ModelRequest, ModelResponse } from "./types";

export function createMockProvider(): ModelProvider {
  return {
    id: "mock",
    async complete(request: ModelRequest): Promise<ModelResponse> {
      const user = [...request.messages].reverse().find((message) => message.role === "user");
      return {
        text: `mock:${user?.content ?? ""}`,
        provider: "mock",
        model: request.model ?? "mock-1",
      };
    },
  };
}
