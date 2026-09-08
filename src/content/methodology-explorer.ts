import type { L } from "@/lib/i18n";

/**
 * Unused explorer for the former ten-stage academic method.
 * Public ITT approach is Understand / Design / Build in `approach.ts`.
 */

export interface ExplorerStage {
  code: string;
  short: L;
  title: L;
  purpose: L;
  questions?: L<string[]>;
  analysed?: L<string[]>;
  output?: L;
  next?: L;
}

export const explorerFieldLabels = {
  purpose: { bg: "Предназначение", en: "Purpose" },
  questions: { bg: "Въпроси", en: "Questions" },
  analysed: { bg: "Какво се анализира", en: "What is analysed" },
  output: { bg: "Резултат от етапа", en: "Output" },
  next: { bg: "Връзка със следващия етап", en: "Relationship to the next stage" },
} as const;

export const explorerStages: ExplorerStage[] = [];
