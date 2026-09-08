import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${isLocale(locale) ? locale : "bg"}`);
}
