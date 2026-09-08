import type { L } from "@/lib/i18n";
import type { GovernanceFunction, Pillar, Stage } from "./types";

/**
 * Unused academic-method leftovers. Public ITT working method lives in `approach.ts`.
 */

export const stages: Stage[] = [];

export const systemComponents: Array<{ code: string; title: L; hint: L }> = [];

export const failureModes: Array<{ code: string; title: L }> = [];

export const pillars: Pillar[] = [];

export const governance: GovernanceFunction[] = [];
