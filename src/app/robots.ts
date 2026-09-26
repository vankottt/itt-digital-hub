import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { allowPublicIndexing } from "@/lib/indexing";

export default function robots(): MetadataRoute.Robots {
  const indexable = allowPublicIndexing();
  return {
    rules: [
      indexable
        ? {
            userAgent: "*",
            allow: "/",
            disallow: [
              "/admin",
              "/admin/",
              "/preview",
              "/preview/",
              "/bg/vik-designer",
              "/en/vik-designer",
              "/bg/ai-act-agent",
              "/en/ai-act-agent",
            ],
          }
        : {
            userAgent: "*",
            disallow: "/",
          },
    ],
    sitemap: indexable ? `${siteUrl()}/sitemap.xml` : undefined,
    host: siteUrl(),
  };
}
