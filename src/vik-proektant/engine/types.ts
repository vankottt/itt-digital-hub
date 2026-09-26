export type VikDocument = {
  documentId: string;
  title: string;
  shortTitle: string;
  number: string;
  year: number | null;
  domains: string[];
  jurisdiction: string;
  language: string;
  status: string;
  dvReference: string;
  effectiveDate: string;
  lastAmendment: string;
  sourceInstitution: string;
  contentCurrency: string;
  contentCompleteness: string;
  missingContentTypes: string[];
  safeForTextual: boolean;
  safeForNumeric: boolean;
  requiresManualVerification: boolean;
  priority: string;
  knowledgeFile: string;
};

export type VikChunk = {
  referenceId: string;
  documentId: string;
  article: string | null;
  articleSlug: string;
  part: number;
  heading: string;
  section: string;
  text: string;
  searchText: string;
  contentHash: string;
  duplicateOf: string | null;
};

export type CorpusAudit = {
  knowledgeFiles: number;
  formats: string[];
  totalBytes: number;
  documents: number;
  chunks: number;
  uniqueChunks: number;
  duplicateChunkGroups: number;
  duplicateChunkCopies: number;
  missingTitle: string[];
  replacementCharacters: number;
  formulaMarkerChunks: number;
  numericCautionDocuments: string[];
  manualVerificationDocuments: string[];
  domains: string[];
};

export type CorpusIndex = {
  documents: VikDocument[];
  chunks: VikChunk[];
  byId: Map<string, VikChunk>;
  audit: CorpusAudit;
};

export type SearchHit = {
  referenceId: string;
  rank: number;
  documentId: string;
  title: string;
  number: string;
  year: number | null;
  dvReference: string;
  contentCurrency: string;
  domains: string[];
  section: string;
  heading: string;
  article: string | null;
  excerpt: string;
  safeForNumeric: boolean;
  contentCompleteness: string;
  missingContentTypes: string[];
  requiresManualVerification: boolean;
};
