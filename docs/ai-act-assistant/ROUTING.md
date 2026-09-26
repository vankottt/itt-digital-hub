# AI Act Assistant routing

The public product is AI Act Assistant. The previous assistant remains in the repository as a legacy implementation.

| Surface | Path | Status |
| --- | --- | --- |
| Product page | `/bg/ai-act`, `/en/ai-act` | Canonical public product |
| Comparison Lab | `/bg/ai-act/compare`, `/en/ai-act/compare` | Canonical demonstration |
| Legacy assistant | `/bg/ai-act-agent`, `/en/ai-act-agent`, plus `/use` and `/build` | Preserved. Direct URL still runs the old implementation. Removed from Tools, the sitemap, and `robots.txt`. Pages send `noindex`. |
| Legacy API | `/api/ai-act/chat`, `/api/ai-act/session`, `/api/ai-act/lead`, `/api/ai-act/kit` | Unchanged |
| V2 comparison API | `/api/ai-act/compare` | New |
| V2 retrieval | `/api/mcp/ai-act` | New. Does not call another model |

There is no public URL containing `v2`, and no redirect from the legacy path. A redirect would replace the rollback URL.
