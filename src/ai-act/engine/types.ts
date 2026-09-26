export type SourceKind = "law" | "guidance" | "interpretation";

export type AiActDocument = {
  documentId: string;
  filename: string;
  title: string;
  authority: "eur-lex" | "european-commission";
  instrument: string;
  version: string;
  url: string;
  completeness: "extract";
  missingNote: string;
};

export type AiActChunk = {
  referenceId: string;
  documentId: string;
  article: string | null;
  point: string | null;
  heading: string;
  kind: SourceKind;
  text: string;
  searchText: string;
  contentHash: string;
  duplicateOf: string | null;
};

export type CorpusIndex = {
  documents: AiActDocument[];
  chunks: AiActChunk[];
  byId: Map<string, AiActChunk>;
};

export type SearchHit = {
  referenceId: string;
  rank: number;
  documentId: string;
  title: string;
  article: string | null;
  point: string | null;
  heading: string;
  kind: SourceKind;
  version: string;
  url: string;
  excerpt: string;
  citation: false;
};
