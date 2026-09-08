import type { InsightRecord, MediaRecord } from "@/lib/cms/types";
import { previewInsightAction, publishInsightAction, saveInsightAction } from "@/app/admin/actions";
import { validateInsightPublish } from "@/lib/cms/truth";

export function InsightEditor({
  insight,
  media = [],
  notice,
  saved,
}: {
  insight?: InsightRecord;
  media?: MediaRecord[];
  notice?: string;
  saved?: boolean;
}) {
  const issues = insight ? validateInsightPublish(insight) : [];
  return (
    <>
      {notice ? <p role="alert">{notice}</p> : null}
      {saved ? <p className="admin-muted">Saved as draft (not published).</p> : null}
      {issues.length ? (
        <ul className="admin-card">
          {issues.map((issue) => (
            <li key={issue.code}>
              {issue.blocking ? "Block: " : "Warn: "}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
      <form action={saveInsightAction} className="admin-form admin-card">
        <input type="hidden" name="id" value={insight?.id ?? ""} />
        <label>
          Slug
          <input name="slug" required defaultValue={insight?.slug} />
        </label>
        <label>
          Type
          <select name="type" defaultValue={insight?.type === "news" ? "news" : "concept-note"}>
            <option value="concept-note">Concept note (Insights)</option>
            <option value="news">News article</option>
          </select>
        </label>
        <label>
          Title BG / EN
          <input name="titleBg" defaultValue={insight?.titleBg} />
          <input name="titleEn" defaultValue={insight?.titleEn} />
        </label>
        <label>
          Summary BG
          <textarea name="summaryBg" defaultValue={insight?.summaryBg} />
        </label>
        <label>
          Summary EN
          <textarea name="summaryEn" defaultValue={insight?.summaryEn} />
        </label>
        <label>
          Body BG (one block per line; ## heading; YouTube URL on its own line)
          <textarea name="bodyBg" defaultValue={(insight?.bodyBg ?? []).join("\n")} />
        </label>
        <label>
          Body EN (same: paste the YouTube URL alone on a line in both locales)
          <textarea name="bodyEn" defaultValue={(insight?.bodyEn ?? []).join("\n")} />
        </label>
        <label>
          Topics BG / EN
          <textarea name="topicsBg" defaultValue={(insight?.topicsBg ?? []).join("\n")} />
          <textarea name="topicsEn" defaultValue={(insight?.topicsEn ?? []).join("\n")} />
        </label>
        <label>
          Related projects
          <textarea name="relatedProjects" defaultValue={(insight?.relatedProjectSlugs ?? []).join("\n")} />
        </label>
        <label>
          Source publication date
          <input type="date" name="date" defaultValue={insight?.date?.slice(0, 10)} />
        </label>
        <label>
          Author (optional)
          <input name="author" defaultValue={insight?.author} />
        </label>
        <label>
          Source BG
          <textarea name="sourceBg" defaultValue={insight?.sourceBg} />
        </label>
        <label>
          Source EN
          <textarea name="sourceEn" defaultValue={insight?.sourceEn} />
        </label>
        <label>
          Card / hero image (media library)
          <select name="heroMediaId" defaultValue={insight?.heroMediaId ?? ""}>
            <option value="">— none —</option>
            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title || item.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          SEO title BG / EN
          <input name="seoTitleBg" defaultValue={insight?.seo.titleBg} />
          <input name="seoTitleEn" defaultValue={insight?.seo.titleEn} />
        </label>
        <label>
          SEO description BG / EN
          <textarea name="seoDescriptionBg" defaultValue={insight?.seo.descriptionBg} />
          <textarea name="seoDescriptionEn" defaultValue={insight?.seo.descriptionEn} />
        </label>
        <button className="admin-btn">Save draft</button>
      </form>
      {insight ? (
        <div className="admin-actions" style={{ marginTop: "1rem" }}>
          <form action={publishInsightAction}>
            <input type="hidden" name="slug" value={insight.slug} />
            <input type="hidden" name="state" value="review" />
            <button className="admin-btn secondary">Submit for review</button>
          </form>
          <form action={publishInsightAction}>
            <input type="hidden" name="slug" value={insight.slug} />
            <input type="hidden" name="state" value="published" />
            <button className="admin-btn">Publish</button>
          </form>
          <form action={previewInsightAction}>
            <input type="hidden" name="slug" value={insight.slug} />
            <input type="hidden" name="locale" value="en" />
            <button className="admin-btn secondary">Preview EN</button>
          </form>
          <form action={previewInsightAction}>
            <input type="hidden" name="slug" value={insight.slug} />
            <input type="hidden" name="locale" value="bg" />
            <button className="admin-btn secondary">Preview BG</button>
          </form>
        </div>
      ) : null}
    </>
  );
}
