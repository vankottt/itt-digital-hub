"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { sa } from "./copy";

export function ProductHeader({
  locale,
  ownerMode,
  onNewAnalysis,
  infoSlot,
}: {
  locale: Locale;
  ownerMode?: boolean;
  onNewAnalysis?: () => void;
  infoSlot?: ReactNode;
}) {
  const copy = sa(locale);
  return (
    <header className="sa-header">
      <div className="sa-header__identity">
        <Link href={href(locale, "tools")} className="sa-header__crumb">
          {copy.tools}
        </Link>
        <strong>{copy.name}</strong>
      </div>
      <div className="sa-header__actions">
        {ownerMode ? (
          <Link className="button admin-link" href={href(locale, "settlement-analyzer", "admin")}>
            {copy.admin}
          </Link>
        ) : null}
        {onNewAnalysis ? (
          <button type="button" className="button new-analysis" onClick={onNewAnalysis}>
            {copy.newAnalysis}
          </button>
        ) : null}
        {infoSlot}
      </div>
    </header>
  );
}
