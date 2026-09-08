import { loadAllRecords } from "@/lib/cms/repository";
import { savePartnerAction } from "@/app/admin/actions";

export default async function AdminPartnersPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { partners } = await loadAllRecords();
  const { error, saved } = await searchParams;
  return (
    <>
      <h1 style={{ fontFamily: "var(--font-source-serif)", fontSize: "1.75rem" }}>Partners / network</h1>
      <p className="admin-muted">Only CONFIRMED + PUBLISHED relationships appear publicly as partners.</p>
      {error ? <p role="alert">{error}</p> : null}
      {saved ? <p className="admin-muted">Saved.</p> : null}
      {partners.map((p) => (
        <form key={p.id} action={savePartnerAction} className="admin-form admin-card" style={{ marginTop: "1rem" }}>
          <input type="hidden" name="id" value={p.id} />
          <label>
            Slug <input name="slug" defaultValue={p.slug} />
          </label>
          <label>
            Name BG / EN
            <input name="nameBg" defaultValue={p.nameBg} />
            <input name="nameEn" defaultValue={p.nameEn} />
          </label>
          <label>
            Relationship
            <select name="relationship" defaultValue={p.relationship}>
              <option value="proposed">Proposed</option>
              <option value="under_discussion">Under discussion</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </label>
          <label>
            Publication
            <select name="publicationState" defaultValue={p.publicationState}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            Note BG / EN
            <textarea name="noteBg" defaultValue={p.noteBg} />
            <textarea name="noteEn" defaultValue={p.noteEn} />
          </label>
          <button className="admin-btn">Save</button>
        </form>
      ))}
      <h2 style={{ marginTop: "2rem" }}>New relationship</h2>
      <form action={savePartnerAction} className="admin-form admin-card">
        <label>
          Slug <input name="slug" required />
        </label>
        <label>
          Name BG / EN
          <input name="nameBg" />
          <input name="nameEn" />
        </label>
        <label>
          Relationship
          <select name="relationship" defaultValue="proposed">
            <option value="proposed">Proposed</option>
            <option value="under_discussion">Under discussion</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </label>
        <button className="admin-btn">Save draft</button>
      </form>
    </>
  );
}
