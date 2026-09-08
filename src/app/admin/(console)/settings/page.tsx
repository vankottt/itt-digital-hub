import { loadAllRecords } from "@/lib/cms/repository";
import { saveSettingsAction } from "@/app/admin/actions";

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { settings, projects, insights, media } = await loadAllRecords();
  const { error, saved } = await searchParams;
  const d = settings.data;
  return (
    <>
      <h1 style={{ fontFamily: "var(--font-source-serif)", fontSize: "1.75rem" }}>Global settings</h1>
      <p className="admin-muted">Homepage layout remains code-controlled. These fields only fill designed slots.</p>
      {error ? <p role="alert">{error}</p> : null}
      {saved ? <p className="admin-muted">Saved.</p> : null}
      <form action={saveSettingsAction} className="admin-form admin-card">
        <label>
          Name BG / EN
          <input name="nameBg" defaultValue={d.nameBg} />
          <input name="nameEn" defaultValue={d.nameEn} />
        </label>
        <label>
          Descriptor BG / EN
          <textarea name="descriptorBg" defaultValue={d.descriptorBg} />
          <textarea name="descriptorEn" defaultValue={d.descriptorEn} />
        </label>
        <label>
          Institutional anchor BG / EN
          <input name="anchorBg" defaultValue={d.anchorBg} />
          <input name="anchorEn" defaultValue={d.anchorEn} />
        </label>
        <label>
          Contact note BG / EN
          <textarea name="contactNoteBg" defaultValue={d.contactNoteBg} />
          <textarea name="contactNoteEn" defaultValue={d.contactNoteEn} />
        </label>
        <label>
          Featured project
          <select name="featuredProjectSlug" defaultValue={d.featuredProjectSlug}>
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.titleEn || p.slug}
              </option>
            ))}
          </select>
        </label>
        <label>
          Featured insight slugs
          <textarea name="featuredInsightSlugs" defaultValue={(d.featuredInsightSlugs ?? insights.map((i) => i.slug)).join("\n")} />
        </label>
        <label>
          Hero image
          <select name="heroMediaId" defaultValue={d.heroMediaId}>
            <option value="">—</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || m.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          Institutional image
          <select name="institutionalMediaId" defaultValue={d.institutionalMediaId}>
            <option value="">—</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || m.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          Research / applied image ids
          <select name="researchMediaId" defaultValue={d.researchMediaId}>
            <option value="">—</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || m.id}
              </option>
            ))}
          </select>
          <select name="appliedMediaId" defaultValue={d.appliedMediaId}>
            <option value="">—</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || m.id}
              </option>
            ))}
          </select>
        </label>
        <button className="admin-btn">Save settings</button>
      </form>
    </>
  );
}
