import Link from "next/link";
import { loadAllRecords } from "@/lib/cms/repository";
import { translationState } from "@/lib/cms/truth";

export default async function AdminProjectsPage() {
  const { projects } = await loadAllRecords();
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ fontFamily: "var(--font-source-serif)", fontSize: "1.75rem" }}>Projects</h1>
        <Link href="/admin/projects/new" className="admin-btn">
          New project
        </Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Slug</th>
            <th>EN / BG</th>
            <th>Lifecycle</th>
            <th>State</th>
            <th>Translation</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/projects/${p.slug}`}>{p.slug}</Link>
              </td>
              <td>
                {p.titleEn || "—"}
                <div className="admin-muted">{p.titleBg || "—"}</div>
              </td>
              <td className="admin-status">{p.lifecycle}</td>
              <td className="admin-status">{p.publicationState}</td>
              <td className="admin-status">{translationState(p.titleBg, p.titleEn)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
