import { notFound } from "next/navigation";
import { loadAllRecords } from "@/lib/cms/repository";
import { InsightEditor } from "@/components/admin/InsightEditor";

export default async function AdminInsightEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { slug } = await params;
  const { error, saved } = await searchParams;
  const { insights, media } = await loadAllRecords();
  const insight = insights.find((i) => i.slug === slug);
  if (!insight) notFound();
  return <InsightEditor insight={insight} media={media} notice={error} saved={Boolean(saved)} />;
}
