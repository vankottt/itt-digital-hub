"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { SiteFooter } from "./SiteFooter";

export function SiteFooterGate({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "";
  if (/^\/(bg|en)\/ai-act-agent\/use\/?$/.test(pathname)) return null;
  if (/^\/(bg|en)\/settlement-analyzer\/?$/.test(pathname)) return null;
  if (/^\/(bg|en)\/settlement-analyzer\/admin\/?$/.test(pathname)) return null;
  return <SiteFooter locale={locale} />;
}
