"use client";

import type { Locale } from "@/lib/i18n";
import ConferenceExperience, { type BootstrapState } from "./conference/ConferenceExperience";

export function AnalyzerEntry({
  locale,
  ownerMode,
  initial,
  testRegistration = false,
}: {
  locale: Locale;
  ownerMode: boolean;
  initial: BootstrapState;
  testRegistration?: boolean;
}) {
  return (
    <ConferenceExperience
      locale={locale}
      ownerMode={ownerMode}
      initial={initial}
      testRegistration={testRegistration}
    />
  );
}
