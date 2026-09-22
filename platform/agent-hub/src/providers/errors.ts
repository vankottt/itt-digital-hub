import type { ModelProviderId } from "./types";

export type ProviderCallCode = "not_configured" | "rate_limited" | "timeout" | "network" | "provider_error";

export class ProviderCallError extends Error {
  readonly code: ProviderCallCode;
  readonly providerId: ModelProviderId;
  readonly status?: number;

  constructor(providerId: ModelProviderId, code: ProviderCallCode, status?: number) {
    super("Model provider request failed.");
    this.name = "ProviderCallError";
    this.providerId = providerId;
    this.code = code;
    this.status = status;
  }
}

export class ProviderNotEnabledError extends Error {
  readonly code = "PROVIDER_NOT_ENABLED";
  readonly providerId: ModelProviderId;
  readonly keyConfigured: boolean;

  constructor(providerId: ModelProviderId, keyConfigured: boolean) {
    super("Model provider is not enabled.");
    this.name = "ProviderNotEnabledError";
    this.providerId = providerId;
    this.keyConfigured = keyConfigured;
  }
}
