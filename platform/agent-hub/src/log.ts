export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  level: LogLevel;
  message: string;
  requestId?: string;
  agentId?: string;
  status?: number;
  durationMs?: number;
  errorCode?: string;
  errorName?: string;
  providerStatus?: number;
  bindHost?: string;
  bindPort?: number;
  provider?: string;
  model?: string;
  outcome?: string;
  fallbackUsed?: boolean;
  inputTokens?: number;
  outputTokens?: number;
  upstreamProvider?: string;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEY = /secret|authorization|api[-_]?key|signature|password|token|cookie|history|knowledge/i;
const USAGE_COUNT_KEY = /^(input|output|prompt|completion)Tokens$/;

export interface Logger {
  log(fields: LogFields): void;
}

export function createLogger(options: { level: LogLevel; write?: (line: string) => void }): Logger {
  const minimum = LEVEL_ORDER[options.level];
  const write = options.write ?? ((line: string) => console.log(line));
  return {
    log(fields) {
      if (LEVEL_ORDER[fields.level] < minimum) return;
      const event = redact({
        timestamp: new Date().toISOString(),
        service: "itt-agent-hub",
        ...fields,
      });
      write(JSON.stringify(event));
    },
  };
}

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (!value || typeof value !== "object") return value;
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = SENSITIVE_KEY.test(key) && !USAGE_COUNT_KEY.test(key) ? "[redacted]" : redact(item);
  }
  return output;
}

export function safeErrorName(error: unknown): string {
  if (error instanceof Error && /^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(error.name)) return error.name;
  return "Error";
}
