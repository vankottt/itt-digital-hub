import { writeFileSync } from "node:fs";
import { getCorpus } from "../src/vik-proektant/engine/corpus";

const corpus = getCorpus();
const audit = {
  ...corpus.audit,
  documentCount: corpus.audit.documents,
  documentRecords: corpus.documents.map((document) => ({
    documentId: document.documentId,
    title: document.title,
    year: document.year,
    number: document.number,
    domains: document.domains,
    safeForNumeric: document.safeForNumeric,
    contentCompleteness: document.contentCompleteness,
    missingContentTypes: document.missingContentTypes,
    requiresManualVerification: document.requiresManualVerification,
    knowledgeFile: document.knowledgeFile,
  })),
};
writeFileSync("docs/vik-proektant/corpus-audit.json", `${JSON.stringify(audit, null, 2)}\n`);
console.info(
  JSON.stringify(
    {
      files: audit.knowledgeFiles,
      bytes: audit.totalBytes,
      documents: audit.documentCount,
      chunks: audit.chunks,
      uniqueChunks: audit.uniqueChunks,
      duplicateChunkGroups: audit.duplicateChunkGroups,
      formulaMarkerChunks: audit.formulaMarkerChunks,
      replacementCharacters: audit.replacementCharacters,
    },
    null,
    2,
  ),
);
