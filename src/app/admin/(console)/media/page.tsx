import { loadAllRecords } from "@/lib/cms/repository";
import { deleteMediaAction, updateMediaAction, uploadMediaAction } from "@/app/admin/actions";

export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { media } = await loadAllRecords();
  const { error, saved } = await searchParams;
  return (
    <>
      <h1 style={{ fontFamily: "var(--font-source-serif)", fontSize: "1.75rem" }}>Media</h1>
      {error ? <p role="alert">{error}</p> : null}
      {saved ? <p className="admin-muted">Saved.</p> : null}
      <form action={uploadMediaAction} className="admin-form admin-card" encType="multipart/form-data">
        <label>
          File
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
        </label>
        <label>
          Title <input name="title" />
        </label>
        <label>
          Alt BG / EN
          <input name="altBg" required />
          <input name="altEn" required />
        </label>
        <label>
          Source / URL
          <input name="source" />
          <input name="sourceUrl" />
        </label>
        <label>
          Usage note <input name="usageNote" />
        </label>
        <label>
          <input type="checkbox" name="temporary" /> Temporary
        </label>
        <label>
          <input type="checkbox" name="replacementRequired" /> Replacement required
        </label>
        <button className="admin-btn">Upload</button>
      </form>
      {media.map((item) => (
        <form key={item.id} action={updateMediaAction} className="admin-form admin-card" style={{ marginTop: "1rem" }}>
          <input type="hidden" name="id" value={item.id} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.publicUrl} alt={item.altEn} style={{ maxWidth: 240, height: "auto" }} />
          <p className="admin-status">
            {item.temporary ? "temporary" : "permanent"} {item.replacementRequired ? "· replace" : ""}
          </p>
          <label>
            Title <input name="title" defaultValue={item.title} />
          </label>
          <label>
            Alt BG / EN
            <input name="altBg" defaultValue={item.altBg} />
            <input name="altEn" defaultValue={item.altEn} />
          </label>
          <label>
            Source / URL
            <input name="source" defaultValue={item.source} />
            <input name="sourceUrl" defaultValue={item.sourceUrl} />
          </label>
          <label>
            <input type="checkbox" name="temporary" defaultChecked={item.temporary} /> Temporary
          </label>
          <label>
            <input type="checkbox" name="replacementRequired" defaultChecked={item.replacementRequired} /> Replacement required
          </label>
          <div className="admin-actions">
            <button className="admin-btn">Save metadata</button>
          </div>
        </form>
      ))}
      {media.map((item) => (
        <form key={`del-${item.id}`} action={deleteMediaAction} style={{ marginTop: "0.35rem" }}>
          <input type="hidden" name="id" value={item.id} />
          <button className="admin-btn danger">Delete {item.title || item.id} if unused</button>
        </form>
      ))}
    </>
  );
}
