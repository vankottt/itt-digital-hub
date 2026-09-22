import { readHubEnv } from "./env";
import { loadHubEnvFile } from "./load-env";
import { createLogger } from "./log";
import { startAgentHub } from "./server";

async function main(): Promise<void> {
  loadHubEnvFile();

  const env = readHubEnv();
  if ("error" in env) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        service: "itt-agent-hub",
        message: env.error,
      }),
    );
    process.exit(1);
  }

  const log = createLogger({ level: env.logLevel });
  const running = await startAgentHub({
    host: env.host,
    port: env.port,
    secret: env.secret,
    log,
  });

  log.log({
    level: "info",
    message: "listening",
    bindHost: env.host,
    bindPort: Number(new URL(running.origin).port),
  });
}

void main();
