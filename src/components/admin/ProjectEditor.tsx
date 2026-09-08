import type { ProjectRecord } from "@/lib/cms/types";
import { publishProjectAction, previewProjectAction, saveProjectAction } from "@/app/admin/actions";
import { validateProjectPublish } from "@/lib/cms/truth";

function area(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.map(String).join("\n");
  if (typeof value === "object" && value && "bg" in value) {
    const loc = value as { bg?: unknown };
    return area(loc.bg);
  }
  return String(value);
}

function loc(payload: Record<string, unknown>, key: string, locale: "bg" | "en"): string {
  const field = payload[key];
  if (!field || typeof field !== "object") return "";
  const rec = field as Record<string, unknown>;
  return area(rec[locale]);
}

export function ProjectEditor({ project, notice, saved }: { project?: ProjectRecord; notice?: string; saved?: boolean }) {
  const payload = project?.payload ?? {};
  const issues = project ? validateProjectPublish(project) : [];
  return (
    <>
      <h1 style={{ fontFamily: "var(--font-source-serif)", fontSize: "1.75rem" }}>{project ? project.slug : "New project"}</h1>
      {saved ? <p className="admin-muted">Saved as draft (not published).</p> : null}
      {notice ? (
        <p role="alert" className="admin-card">
          {notice}
        </p>
      ) : null}
      {issues.length ? (
        <ul className="admin-card">
          {issues.map((i) => (
            <li key={i.code}>
              {i.blocking ? "Block: " : "Warn: "}
              {i.message}
            </li>
          ))}
        </ul>
      ) : null}
      <form action={saveProjectAction} className="admin-form admin-card" style={{ marginTop: "1rem" }}>
        <input type="hidden" name="id" value={project?.id ?? ""} />
        <label>
          Slug
          <input name="slug" required defaultValue={project?.slug} />
        </label>
        <label>
          Title BG
          <input name="titleBg" defaultValue={project?.titleBg} />
        </label>
        <label>
          Title EN
          <input name="titleEn" defaultValue={project?.titleEn} />
        </label>
        <label>
          Standfirst BG
          <textarea name="standfirstBg" defaultValue={project?.standfirstBg} />
        </label>
        <label>
          Standfirst EN
          <textarea name="standfirstEn" defaultValue={project?.standfirstEn} />
        </label>
        <label>
          Summary BG
          <textarea name="summaryBg" defaultValue={project?.summaryBg} />
        </label>
        <label>
          Summary EN
          <textarea name="summaryEn" defaultValue={project?.summaryEn} />
        </label>
        <label>
          Public status
          <select name="status" defaultValue={project?.status ?? "pilot-concept"}>
            <option value="pilot-concept">Pilot concept</option>
            <option value="proposed-mandate">Proposed mandate</option>
            <option value="in-development">In development</option>
            <option value="active-pilot">Active pilot</option>
            <option value="production">Production</option>
            <option value="internal-rd">Internal R&D</option>
            <option value="previous-professional">Previous professional work</option>
            <option value="client-project">Client project</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Lifecycle
          <select name="lifecycle" defaultValue={project?.lifecycle ?? "concept"}>
            <option value="concept">Concept</option>
            <option value="proposed">Proposed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Type BG / EN
          <input name="typeBg" defaultValue={project?.typeBg} />
          <input name="typeEn" defaultValue={project?.typeEn} />
        </label>
        <label>
          Domain BG / EN
          <input name="domainBg" defaultValue={project?.domainBg} />
          <input name="domainEn" defaultValue={project?.domainEn} />
        </label>
        <label>
          Methodology
          <input name="methodologyName" defaultValue={project?.methodologyName ?? "Understand · Design · Build"} />
        </label>
        <label>
          <input type="hidden" name="featuredSubmitted" value="1" />
          <input type="checkbox" name="featured" defaultChecked={project?.featured} /> Featured on homepage
        </label>
        <label>
          System problem BG (one paragraph per line)
          <textarea name="systemProblemBg" defaultValue={loc(payload, "systemProblem", "bg")} />
        </label>
        <label>
          System problem EN
          <textarea name="systemProblemEn" defaultValue={loc(payload, "systemProblem", "en")} />
        </label>
        <label>
          Objective BG
          <textarea name="objectiveBg" defaultValue={loc(payload, "objective", "bg")} />
        </label>
        <label>
          Objective EN
          <textarea name="objectiveEn" defaultValue={loc(payload, "objective", "en")} />
        </label>
        <label>
          Expected outcomes BG
          <textarea name="expectedBg" defaultValue={loc(payload, "expectedOutcomes", "bg")} />
        </label>
        <label>
          Expected outcomes EN
          <textarea name="expectedEn" defaultValue={loc(payload, "expectedOutcomes", "en")} />
        </label>
        <label>
          Measured results BG
          <textarea name="measuredBg" defaultValue={loc(payload, "measuredResults", "bg")} />
        </label>
        <label>
          Measured results EN
          <textarea name="measuredEn" defaultValue={loc(payload, "measuredResults", "en")} />
        </label>
        <label>
          Related project slugs
          <textarea name="relatedProjects" defaultValue={(project?.relatedProjectSlugs ?? []).join("\n")} />
        </label>
        <label>
          Related insight slugs
          <textarea name="relatedInsights" defaultValue={(project?.relatedInsightSlugs ?? []).join("\n")} />
        </label>
        <label>
          SEO title BG / EN
          <input name="seoTitleBg" defaultValue={project?.seo.titleBg} />
          <input name="seoTitleEn" defaultValue={project?.seo.titleEn} />
        </label>
        <label>
          SEO description BG / EN
          <textarea name="seoDescriptionBg" defaultValue={project?.seo.descriptionBg} />
          <textarea name="seoDescriptionEn" defaultValue={project?.seo.descriptionEn} />
        </label>
        <div className="admin-actions">
          <button type="submit" className="admin-btn">
            Save draft
          </button>
        </div>
      </form>
      {project ? (
        <div className="admin-actions" style={{ marginTop: "1rem" }}>
          <form action={publishProjectAction}>
            <input type="hidden" name="slug" value={project.slug} />
            <input type="hidden" name="state" value="review" />
            <button className="admin-btn secondary">Submit for review</button>
          </form>
          <form action={publishProjectAction}>
            <input type="hidden" name="slug" value={project.slug} />
            <input type="hidden" name="state" value="published" />
            <button className="admin-btn">Publish</button>
          </form>
          <form action={publishProjectAction}>
            <input type="hidden" name="slug" value={project.slug} />
            <input type="hidden" name="state" value="archived" />
            <button className="admin-btn secondary">Archive</button>
          </form>
          <form action={previewProjectAction}>
            <input type="hidden" name="slug" value={project.slug} />
            <input type="hidden" name="locale" value="en" />
            <button className="admin-btn secondary">Preview EN</button>
          </form>
          <form action={previewProjectAction}>
            <input type="hidden" name="slug" value={project.slug} />
            <input type="hidden" name="locale" value="bg" />
            <button className="admin-btn secondary">Preview BG</button>
          </form>
        </div>
      ) : null}
    </>
  );
}
