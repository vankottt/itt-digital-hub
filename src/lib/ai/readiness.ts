/**
 * Future editorial-assist actions. No external LLM is called in V2.
 * Any later implementation must write drafts only — never publish.
 */
export const editorialAssistActions = [
  "draft-en-translation",
  "summarize-project-for-homepage",
  "propose-metadata",
  "propose-alt-text",
  "structure-long-project",
  "flag-unsupported-claims",
  "insight-draft-from-source",
] as const;

export type EditorialAssistAction = (typeof editorialAssistActions)[number];

export function editorialAssistEnabled(): boolean {
  return false;
}
