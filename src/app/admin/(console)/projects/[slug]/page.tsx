import { notFound } from "next/navigation";
import { loadAllRecords } from "@/lib/cms/repository";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default async function AdminProjectEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { slug } = await params;
  const { error, saved } = await searchParams;
  if (slug === "new") {
    return <ProjectEditor notice={error} saved={Boolean(saved)} />;
  }
  const { projects } = await loadAllRecords();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return <ProjectEditor project={project} notice={error} saved={Boolean(saved)} />;
}
