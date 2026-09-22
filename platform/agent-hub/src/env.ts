import {
  DEFAULT_HUB_HOST,
  DEFAULT_HUB_PORT,
  isPlaceholderSecret,
  MIN_SHARED_SECRET_CHARS,
} from "../../shared/src/index";
import { type LogLevel } from "./log";

export interface HubEnv {
  host: string;
  port: number;
  secret: string;
  logLevel: LogLevel;
  nodeEnv: string;
}

export function readHubEnv(env: NodeJS.ProcessEnv = process.env): HubEnv | { error: string } {
  const secret = env.ITT_HUB_SHARED_SECRET?.trim() ?? "";
  const nodeEnv = env.NODE_ENV?.trim() || "development";
  if (secret.length < MIN_SHARED_SECRET_CHARS) {
    return { error: "ITT_HUB_SHARED_SECRET must be at least 16 characters" };
  }
  if (isPlaceholderSecret(secret) && nodeEnv === "production") {
    return { error: "Refusing placeholder ITT_HUB_SHARED_SECRET when NODE_ENV is production" };
  }

  const host = env.HOST?.trim() || DEFAULT_HUB_HOST;
  if (host.length > 255 || /[\s/]/.test(host)) return { error: "HOST is invalid" };

  const port = readPort(env.PORT);
  if (port === null) return { error: "PORT is invalid" };

  return {
    host,
    port,
    secret,
    logLevel: readLogLevel(env.LOG_LEVEL),
    nodeEnv,
  };
}

function readPort(value: string | undefined): number | null {
  if (!value?.trim()) return DEFAULT_HUB_PORT;
  if (!/^\d+$/.test(value.trim())) return null;
  const port = Number(value.trim());
  if (port < 1 || port > 65535) return null;
  return port;
}

function readLogLevel(value: string | undefined): LogLevel {
  if (value === "debug" || value === "info" || value === "warn" || value === "error") return value;
  return "info";
}
