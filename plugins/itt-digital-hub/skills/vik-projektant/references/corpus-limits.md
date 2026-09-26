# Corpus limits

Regulatory statements come only from `search_vik_knowledge` and `get_vik_reference`.

The indexed collection is the project knowledge markdown, one document per act. Retrieval collapses identical chunk text so a duplicate copy is not a second source.

Treat a passage as incomplete when the tool marks `safeForNumeric` false, lists missing content types, or the text says an equation was not extracted. In that case do not reconstruct the missing formula or coefficient.

Page numbers are absent unless a tool result includes one. Do not invent a page or an article that was not returned.

`list_vik_sources` describes the collection. It is not evidence for a requirement.
