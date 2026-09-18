export class AiActProviderError extends Error {
  readonly code: import("./types").AiActErrorCode;
  readonly provider?: string;

  constructor(code: import("./types").AiActErrorCode, message: string, provider?: string) {
    super(message);
    this.name = "AiActProviderError";
    this.code = code;
    this.provider = provider;
  }
}
