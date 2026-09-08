import Link from "next/link";
import { loadAllRecords } from "@/lib/cms/repository";
import { InsightEditor } from "@/components/admin/InsightEditor";

export default async function AdminInsightsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { insights, media } = await loadAllRecords();
  const { error, saved } = await searchParams;
  return (
    <>
      <h1 style={{ fontFamily: "var(--font-source-serif)", fontSize: "1.75rem" }}>Insights &amp; news</h1>
      {error ? <p role="alert">{error}</p> : null}
      {saved ? <p className="admin-muted">Saved.</p> : null}
      <ul className="admin-card">
        {insights.map((i) => (
          <li key={i.id}>
            <Link href={`/admin/insights/${i.slug}`}>{i.titleEn || i.slug}</Link> · <span className="admin-status">{i.type}</span> ·{" "}
            <span className="admin-status">{i.publicationState}</span>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: "2rem" }}>New article</h2>
      <InsightEditor media={media} />
    </>
  );
}
