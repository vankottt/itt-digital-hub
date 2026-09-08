/**
 * Development fixtures are local UI samples only.
 * They must never render in production builds and must never be imported
 * into the hosted CMS.
 */
export function isDevFixturesEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.CIT_DEV_FIXTURES === "1" && env.NODE_ENV !== "production";
}
