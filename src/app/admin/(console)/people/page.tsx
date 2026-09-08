import { loadAllRecords } from "@/lib/cms/repository";
import { publishPersonAction, savePersonAction } from "@/app/admin/actions";

export default async function AdminPeoplePage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { people } = await loadAllRecords();
  const { error, saved } = await searchParams;
  return (
    <>
      <h1 style={{ fontFamily: "var(--font-source-serif)", fontSize: "1.75rem" }}>Team</h1>
      <p className="admin-muted">Planned roles cannot be published as named public profiles.</p>
      {error ? <p role="alert">{error}</p> : null}
      {saved ? <p className="admin-muted">Saved.</p> : null}
      {people.map((person) => (
        <form key={person.id} action={savePersonAction} className="admin-form admin-card" style={{ marginTop: "1rem" }}>
          <input type="hidden" name="id" value={person.id} />
          <label>
            Slug <input name="slug" defaultValue={person.slug} />
          </label>
          <label>
            Kind
            <select name="kind" defaultValue={person.kind}>
              <option value="appointed_person">Appointed person</option>
              <option value="planned_role">Planned role</option>
            </select>
          </label>
          <label>
            Name BG / EN
            <input name="nameBg" defaultValue={person.nameBg} />
            <input name="nameEn" defaultValue={person.nameEn} />
          </label>
          <label>
            Confirmed role BG / EN
            <input name="roleBg" defaultValue={person.roleBg} />
            <input name="roleEn" defaultValue={person.roleEn} />
          </label>
          <label>
            Bio BG / EN
            <textarea name="bioBg" defaultValue={person.bioBg.join("\n")} />
            <textarea name="bioEn" defaultValue={person.bioEn.join("\n")} />
          </label>
          <p className="admin-status">State: {person.publicationState}</p>
          <div className="admin-actions">
            <button className="admin-btn">Save draft</button>
          </div>
        </form>
      ))}
      <h2 style={{ marginTop: "2rem" }}>New person</h2>
      <form action={savePersonAction} className="admin-form admin-card">
        <label>
          Slug <input name="slug" required />
        </label>
        <label>
          Kind
          <select name="kind" defaultValue="appointed_person">
            <option value="appointed_person">Appointed person</option>
            <option value="planned_role">Planned role</option>
          </select>
        </label>
        <label>
          Name BG / EN
          <input name="nameBg" />
          <input name="nameEn" />
        </label>
        <label>
          Role BG / EN
          <input name="roleBg" />
          <input name="roleEn" />
        </label>
        <button className="admin-btn">Save draft</button>
      </form>
      {people.map((person) => (
        <form key={`pub-${person.id}`} action={publishPersonAction} className="admin-actions" style={{ marginTop: "0.5rem" }}>
          <input type="hidden" name="slug" value={person.slug} />
          <input type="hidden" name="state" value="published" />
          <button className="admin-btn secondary">Publish {person.slug}</button>
        </form>
      ))}
    </>
  );
}
